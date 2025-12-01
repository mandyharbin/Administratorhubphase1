# Admin Library - FHIR Implementation Guide

## Overview
The Admin Library Dashboard is now fully FHIR-compliant with comprehensive support for creating, editing, and managing Forms (Questionnaires), Consent Templates, Documents, and Checklists with proper FHIR R4 alignment.

---

## 🎯 FHIR Alignment Implementation

### 1. Consent Builder - FHIR Compliance

#### **FHIR Resource Mapping**

| UI Field | FHIR Field | Type | Description |
|----------|------------|------|-------------|
| Title | `Consent.title` | string | Human-readable title |
| Status | `Consent.status` | code | draft \| proposed \| active \| rejected \| inactive \| entered-in-error |
| Category | `Consent.category[].coding[]` | CodeableConcept | Standard code sets (LOINC, HL7) |
| Policy URI | `Consent.policy[].uri` | uri | Link to policy document |
| Effective Period | `Consent.provision.period` | Period | start/end dates |
| PDF Attachment | `Consent.sourceReference` | Reference(DocumentReference) | Points to the document patient saw |
| Signature Toggle | `Provenance.signature` | Signature | Electronic signature capture |

#### **Consent.category Code Sets**

The system supports the following standard FHIR category codes:

```json
[
  {
    "code": "59284-0",
    "display": "HIPAA Privacy",
    "system": "http://loinc.org"
  },
  {
    "code": "financial",
    "display": "Financial Responsibility",
    "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes"
  },
  {
    "code": "telehealth",
    "display": "Telehealth Consent",
    "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes"
  },
  {
    "code": "treatment",
    "display": "Treatment Consent",
    "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes"
  },
  {
    "code": "research",
    "display": "Research Participation",
    "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes"
  },
  {
    "code": "acd",
    "display": "Advance Care Directive",
    "system": "http://terminology.hl7.org/CodeSystem/consentcategorycodes"
  }
]
```

#### **Consent.status Values**

All FHIR-compliant status values are supported:

- `draft` - Still being authored
- `proposed` - Proposed to patient
- `active` - Currently in effect
- `rejected` - Patient rejected
- `inactive` - No longer in effect
- `entered-in-error` - Entered by mistake

#### **DocumentReference Linkage**

When a PDF is uploaded, the system creates a `DocumentReference` resource:

```json
{
  "resourceType": "DocumentReference",
  "id": "DOC-ABC123",
  "status": "current",
  "type": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "64290-0",
      "display": "Consent Document"
    }]
  },
  "subject": {
    "reference": "Patient/{{patient-id}}"
  },
  "content": [{
    "attachment": {
      "contentType": "application/pdf",
      "title": "hipaa-consent-v2.pdf",
      "creation": "2025-11-24T10:30:00Z"
    }
  }]
}
```

The Consent resource then references this document:

```json
{
  "resourceType": "Consent",
  "sourceReference": {
    "reference": "DocumentReference/DOC-ABC123",
    "display": "hipaa-consent-v2.pdf"
  }
}
```

#### **Provenance.signature Auto-Creation**

When "Require Electronic Signature" is enabled, a Provenance template is created:

```json
{
  "resourceType": "Provenance",
  "target": [{
    "reference": "Consent/CON-ABC123"
  }],
  "recorded": "{{signature-timestamp}}",
  "agent": [{
    "who": {
      "reference": "Patient/{{patient-id}}"
    }
  }],
  "signature": [{
    "type": [{
      "system": "urn:iso-astm:E1762-95:2013",
      "code": "1.2.840.10065.1.12.1.1",
      "display": "Author's Signature"
    }],
    "when": "{{signature-timestamp}}",
    "who": {
      "reference": "Patient/{{patient-id}}"
    },
    "data": "{{signature-data-base64}}"
  }]
}
```

**At Patient Submission:**
- Timestamp is recorded (ISO 8601 format)
- Signature image captured as canvas drawing
- Converted to Base64 PNG/JPEG
- Stored in `Provenance.signature[].data`
- Optionally stored as separate Binary/DocumentReference

---

### 2. Form Builder - FHIR Compliance

#### **FHIR Resource Mapping**

| UI Field | FHIR Field | Type | Description |
|----------|------------|------|-------------|
| Form Title | `Questionnaire.title` | string | Required - Form name |
| Description | `Questionnaire.description` | markdown | Form purpose |
| Status | `Questionnaire.status` | code | draft \| active \| retired |
| Version | `Questionnaire.version` | string | Semantic versioning |
| Field Type | `Questionnaire.item.type` | code | string, text, integer, date, choice, etc. |
| Required Toggle | `Questionnaire.item.required` | boolean | Field validation |
| Answer Options | `Questionnaire.item.answerOption[]` | array | For choice fields |
| Conditional Logic | `Questionnaire.item.enableWhen[]` | array | Show/hide rules |

#### **Supported Field Types**

All FHIR Questionnaire item types are supported:

- `string` - Short text input
- `text` - Long text (multi-line)
- `integer` - Whole numbers
- `decimal` - Decimal numbers
- `date` - Date picker
- `time` - Time picker
- `dateTime` - Date and time
- `boolean` - Yes/No toggle
- `choice` - Single choice (radio/dropdown)
- `open-choice` - Choice with "Other" option
- `attachment` - File upload
- `quantity` - Number with unit
- `reference` - Reference to another resource

---

## 🏗️ Component Library

### Reusable FHIR-Compliant Components

#### 1. **SignatureToggle**
```tsx
<SignatureToggle
  enabled={requireSignature}
  onChange={setRequireSignature}
  label="Require Electronic Signature"
  description="Maps to: Provenance.signature (FHIR)"
/>
```

**Props:**
- `enabled`: boolean
- `onChange`: (enabled: boolean) => void
- `label?`: string
- `description?`: string

**FHIR Mapping:** Creates Provenance.signature resource

---

#### 2. **AttachmentUpload**
```tsx
<AttachmentUpload
  accept="application/pdf"
  maxSizeMB={10}
  onFileSelect={handleFileSelect}
  uploadedFile={file}
  onRemove={handleRemove}
  label="PDF Attachment"
/>
```

**Props:**
- `accept`: string (MIME type)
- `maxSizeMB`: number
- `onFileSelect`: (file: File) => void
- `uploadedFile?`: File | null
- `onRemove?`: () => void
- `label?`: string
- `description?`: string

**Features:**
- File type validation
- File size validation
- Preview with file info
- Remove functionality
- Success/error toasts

**FHIR Mapping:** Creates DocumentReference with attachment

---

#### 3. **FieldTypeDropdown**
```tsx
<FieldTypeDropdown
  value={fieldType}
  onChange={setFieldType}
  label="Field Type"
  showFhirMapping={true}
/>
```

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `label?`: string
- `showFhirMapping?`: boolean

**Features:**
- All FHIR Questionnaire.item.type values
- FHIR type mapping display
- Field descriptions

**FHIR Mapping:** Sets Questionnaire.item.type

---

#### 4. **RuleBuilderRow** (Conditional Logic)
```tsx
<RuleBuilderRow
  rule={rule}
  availableFields={fields}
  onChange={handleRuleChange}
  onRemove={handleRemove}
/>
```

**Props:**
- `rule`: { id, sourceField, operator, value, action, targetField }
- `availableFields`: Array<{ id, label, type }>
- `onChange`: (rule) => void
- `onRemove`: () => void

**Operators:**
- `=` - Equals
- `!=` - Not Equals
- `>` / `<` / `>=` / `<=` - Comparisons
- `contains` - Contains text
- `exists` - Has value
- `notexists` - Is empty

**Actions:**
- `show` - Show target field
- `hide` - Hide target field
- `require` - Make target field required
- `disable` - Disable target field

**FHIR Mapping:** Creates Questionnaire.item.enableWhen rules

**Example FHIR Output:**
```json
{
  "linkId": "dueDate",
  "type": "date",
  "text": "Expected Due Date",
  "enableWhen": [{
    "question": "pregnant",
    "operator": "=",
    "answerBoolean": true
  }],
  "enableBehavior": "all"
}
```

---

#### 5. **TextEditor** (Rich Text)
```tsx
<TextEditor
  value={content}
  onChange={setContent}
  label="Content"
  enableFormatting={true}
  rows={10}
/>
```

**Props:**
- `value`: string
- `onChange`: (value: string) => void
- `label?`: string
- `placeholder?`: string
- `rows?`: number
- `enableFormatting?`: boolean

**Features:**
- Plain text mode
- Rich text mode toggle
- Merge field support: `{{patient.name}}`, `{{practice.name}}`, `{{date}}`
- Formatting toolbar (bold, italic, underline)

---

#### 6. **RequiredToggle**
```tsx
<RequiredToggle
  required={isRequired}
  onChange={setIsRequired}
  label="Required Field"
  fhirMapping="Questionnaire.item.required"
/>
```

**Props:**
- `required`: boolean
- `onChange`: (required: boolean) => void
- `label?`: string
- `fhirMapping?`: string

**FHIR Mapping:** Sets Questionnaire.item.required

---

## 📊 Builder Workflows

### Create → Edit → Publish Flow

```
1. CREATE
   ↓
   User clicks "Create New" → Select type (Form/Consent/Document/Checklist)
   ↓
   Builder opens with empty template
   ↓
   User fills in required fields
   ↓
   "Save as Draft" (status = draft)

2. EDIT
   ↓
   User clicks Edit icon on table row
   ↓
   Builder opens with populated data
   ↓
   User modifies fields
   ↓
   "Save as Draft" updates existing

3. PUBLISH
   ↓
   User clicks "Publish Template"
   ↓
   Validation runs
   ↓
   If valid: status changes to 'active'
   ↓
   If invalid: Shows error list
   ↓
   Toast notification confirms success

4. RETURN
   ↓
   Dialog closes
   ↓
   Table refreshes with updated data
   ↓
   New/updated item appears in list
```

### Error → Correct → Re-Publish Flow

```
1. ERROR DETECTION
   ↓
   User clicks "Publish Template"
   ↓
   Validation fails
   ↓
   Red error banner shows at top
   ↓
   Lists all validation errors

2. CORRECTION
   ↓
   User switches to appropriate tab
   ↓
   Fixes each error
   ↓
   Real-time field validation

3. RE-PUBLISH
   ↓
   User clicks "Publish Template" again
   ↓
   Validation passes
   ↓
   Status → 'active'
   ↓
   Version incremented (optional)
   ↓
   Success toast
```

---

## 🎨 Version History

Each asset tracks complete version history:

**Version History Dialog:**
- Timeline view with all versions
- Current version highlighted
- Shows: version number, status, date, author, changes
- Actions: View previous version, Restore to version

**FHIR Versioning:**
- Uses `meta.versionId` 
- Semantic versioning (1.0.0, 1.1.0, 2.0.0)
- `meta.lastUpdated` timestamp

---

## 🔄 Validation States

### Form Validation

**Required Fields:**
- Title ✓
- Category ✓
- Policy URI (for consents) ✓
- At least one field (for forms) ✓

**Business Rules:**
- Cannot publish without fixing all errors
- Cannot activate retired items in bulk
- File uploads must meet size/type requirements

**Visual Indicators:**
- ✅ Green border = Valid
- ❌ Red border = Invalid
- ⚠️ Yellow badge = Draft
- 🟢 Green badge = Active
- ⚪ Gray badge = Retired

---

## 📚 Complete FHIR Resource Examples

### Example 1: HIPAA Consent with Signature

```json
{
  "resourceType": "Consent",
  "id": "CON-HIPAA-001",
  "meta": {
    "versionId": "2.0.0",
    "lastUpdated": "2025-11-24T10:30:00Z"
  },
  "status": "active",
  "scope": {
    "coding": [{
      "system": "http://terminology.hl7.org/CodeSystem/consentscope",
      "code": "patient-privacy"
    }]
  },
  "category": [{
    "coding": [{
      "system": "http://loinc.org",
      "code": "59284-0",
      "display": "HIPAA Privacy"
    }]
  }],
  "patient": {
    "reference": "Patient/12345"
  },
  "dateTime": "2025-11-24T10:30:00Z",
  "policy": [{
    "uri": "https://example.com/policies/hipaa-2025"
  }],
  "sourceReference": {
    "reference": "DocumentReference/DOC-001",
    "display": "hipaa-consent-2025.pdf"
  },
  "provision": {
    "type": "permit",
    "period": {
      "start": "2025-11-24",
      "end": "2026-11-24"
    }
  }
}
```

**Associated Provenance:**
```json
{
  "resourceType": "Provenance",
  "id": "PROV-001",
  "target": [{
    "reference": "Consent/CON-HIPAA-001"
  }],
  "recorded": "2025-11-24T10:35:00Z",
  "agent": [{
    "who": {
      "reference": "Patient/12345",
      "display": "John Doe"
    }
  }],
  "signature": [{
    "type": [{
      "system": "urn:iso-astm:E1762-95:2013",
      "code": "1.2.840.10065.1.12.1.1",
      "display": "Author's Signature"
    }],
    "when": "2025-11-24T10:35:00Z",
    "who": {
      "reference": "Patient/12345"
    },
    "data": "iVBORw0KGgoAAAANSUhEUgAA..."
  }]
}
```

### Example 2: New Patient Intake Questionnaire

```json
{
  "resourceType": "Questionnaire",
  "id": "QR-INTAKE-001",
  "meta": {
    "versionId": "1.2.0",
    "lastUpdated": "2025-11-20T14:00:00Z"
  },
  "url": "https://example.com/fhir/Questionnaire/new-patient-intake",
  "title": "New Patient Intake Form",
  "status": "active",
  "description": "Comprehensive intake questionnaire for new patients",
  "subjectType": ["Patient"],
  "item": [
    {
      "linkId": "demographics",
      "type": "group",
      "text": "Demographics",
      "item": [
        {
          "linkId": "fullName",
          "type": "string",
          "text": "Full Legal Name",
          "required": true
        },
        {
          "linkId": "dob",
          "type": "date",
          "text": "Date of Birth",
          "required": true
        },
        {
          "linkId": "gender",
          "type": "choice",
          "text": "Gender",
          "required": true,
          "answerOption": [
            { "valueString": "Male" },
            { "valueString": "Female" },
            { "valueString": "Other" },
            { "valueString": "Prefer not to say" }
          ]
        }
      ]
    },
    {
      "linkId": "pregnant",
      "type": "boolean",
      "text": "Are you currently pregnant?",
      "required": false
    },
    {
      "linkId": "dueDate",
      "type": "date",
      "text": "Expected Due Date",
      "required": false,
      "enableWhen": [{
        "question": "pregnant",
        "operator": "=",
        "answerBoolean": true
      }],
      "enableBehavior": "all"
    }
  ]
}
```

---

## 🚀 Getting Started

### Accessing the Admin Library

1. Navigate to **Admin Library** in sidebar
2. View all forms, consents, documents, and checklists
3. Use search/filter to find specific items
4. Click "Create New" to open builder

### Creating a Consent Template

1. Click "Create New" → "Consent Template"
2. **Basic Info Tab:**
   - Enter title (required)
   - Select category (HIPAA, financial, etc.)
   - Set status (draft recommended)
   - Add policy URI
3. **Content Tab:**
   - Add plain text content OR
   - Add HTML content OR
   - Upload PDF
4. **Signature Tab:**
   - Toggle "Require Electronic Signature"
   - Review signature configuration
5. **FHIR Preview Tab:**
   - Review generated FHIR resource
6. Click "Publish Template" or "Save as Draft"

### Creating a Form (Questionnaire)

1. Click "Create New" → "Form (Questionnaire)"
2. Add form title and description
3. Add questions/fields
4. For each field:
   - Set field type
   - Toggle required
   - Add answer options (for choice fields)
5. Add conditional logic rules
6. Preview form
7. Validate and publish

---

## 📋 Component Library Access

Navigate to **Component Library** in the sidebar to view:

- ✅ All reusable components with live demos
- ✅ Component props and usage examples
- ✅ FHIR field mappings
- ✅ Interactive playground

---

## 🎯 Summary

**Implemented:**
- ✅ Full FHIR R4 Consent resource compliance
- ✅ Consent.category with standard code sets (LOINC, HL7)
- ✅ Consent.status (all 6 states)
- ✅ DocumentReference linkage via sourceReference
- ✅ Provenance.signature auto-creation
- ✅ Questionnaire FHIR compliance
- ✅ Component Library with 6 reusable components
- ✅ Rule Builder for conditional logic
- ✅ Version History tracking
- ✅ Complete Create → Edit → Publish workflows
- ✅ Error → Correct → Re-Publish flows
- ✅ Validation states and visual indicators
- ✅ PDF upload with DocumentReference creation
- ✅ Electronic signature toggle with Provenance template

**Status:** ✅ Production Ready
