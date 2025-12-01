# Import Article Form - Visual Demo

## Button Location
```
┌─────────────────────────────────────────────────────────────┐
│ Showing 5 knowledge sources                                 │
│                                                              │
│  [+ Add Knowledge Source]  [📤 Import Article]             │
└─────────────────────────────────────────────────────────────┘
```

---

## Form Layout

### Dialog Header
```
╔═══════════════════════════════════════════════════════════════╗
║  Import Patient Education Article                            ║
║  Add educational content that the AI can reference when      ║
║  responding to patients                                      ║
╚═══════════════════════════════════════════════════════════════╝
```

### Content Type Badge
```
Content Type:  [📄 Patient Education Article]
```

---

## Two-Column Form

### Left Column                    │  Right Column
```
┌──────────────────────────────┐  │  ┌──────────────────────────────┐
│ Title *                      │  │  │ Audience                     │
│ ┌──────────────────────────┐ │  │  │ ┌──────────────────────────┐ │
│ │ Managing Type 2 Diabetes │ │  │  │ │ Adults with Diabetes     │ │
│ └──────────────────────────┘ │  │  │ └──────────────────────────┘ │
│                              │  │  │                              │
│ Article Body *               │  │  │ Condition/Topic              │
│ ┌──────────────────────────┐ │  │  │ ┌──────────────────────────┐ │
│ │ Type 2 diabetes is a     │ │  │  │ │ Diabetes Management      │ │
│ │ chronic condition that   │ │  │  │ └──────────────────────────┘ │
│ │ affects how your body    │ │  │  │                              │
│ │ processes blood sugar... │ │  │  │ Language                     │
│ │                          │ │  │  │ ┌──────────────────────────┐ │
│ │                          │ │  │  │ │ ▼ English                │ │
│ │                          │ │  │  │ └──────────────────────────┘ │
│ └──────────────────────────┘ │  │  │                              │
│ [📤 Upload Document] PDF,DOC │  │  │ Review Date                  │
│                              │  │  │ ┌──────────────────────────┐ │
│ Category                     │  │  │ │ 📅 12/01/2026            │ │
│ ┌──────────────────────────┐ │  │  │ └──────────────────────────┘ │
│ │ ▼ Clinical               │ │  │  │ Next content review date     │
│ └──────────────────────────┘ │  │  │                              │
│                              │  │  │ Author                       │
│ Applies To                   │  │  │ ┌──────────────────────────┐ │
│ ┌──────────────────────────┐ │  │  │ │ Dr. Jennifer Martinez    │ │
│ │ ☑ All Practices          │ │  │  │ └──────────────────────────┘ │
│ │   [Organization-wide]    │ │  │  │                              │
│ │                          │ │  │  │ Source                       │
│ │ ☐ Select specific...     │ │  │  │ ┌──────────────────────────┐ │
│ └──────────────────────────┘ │  │  │ │ Internal - Endo Team     │ │
│                              │  │  │ └──────────────────────────┘ │
│ Tags (Keywords)              │  │  │                              │
│ ┌──────────────────────────┐ │  │  │ ┌──────────────────────────┐ │
│ │diabetes, diet, nutrition │ │  │  │ │ ✓ Review Status          │ │
│ └──────────────────────────┘ │  │  │ │ Content will be marked   │ │
│ Comma-separated keywords     │  │  │ │ as reviewed on import    │ │
│                              │  │  │ └──────────────────────────┘ │
└──────────────────────────────┘  │  └──────────────────────────────┘
```

---

## AI Preview Section (Dynamic - appears when title & body filled)

```
╔═══════════════════════════════════════════════════════════════╗
║ ✨ AI Preview: How this will appear to patients              ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │  Managing Type 2 Diabetes                               │ ║
║  │                                                          │ ║
║  │  Type 2 diabetes is a chronic condition that affects    │ ║
║  │  how your body processes blood sugar (glucose). With    │ ║
║  │  Type 2 diabetes, your body either resists the effects  │ ║
║  │  of insulin or doesn't produce enough...                │ ║
║  │                                                          │ ║
║  │  Read more →                                            │ ║
║  │  ─────────────────────────────────────────────────────  │ ║
║  │  Available at:                                          │ ║
║  │  [🏥 All Practices]                                     │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

### When Specific Practices Selected:
```
║  │  Available at:                                          │ ║
║  │  [Main Street Family Practice]  [Downtown Medical]     │ ║
║  │  [Westside Pediatrics]                                 │ ║
```

---

## Action Buttons

```
┌───────────────────────────────────────────────────────────────┐
│                                     [Cancel]  [✓ Import Article]│
└───────────────────────────────────────────────────────────────┘
```

**Note:** Import Article button is **disabled** (grayed out) until both Title and Article Body are filled.

---

## Sample Filled Form

### Example 1: Clinical Article
```
Title: Managing Type 2 Diabetes with Diet
Article Body: Type 2 diabetes is a chronic condition that affects how your 
body processes blood sugar (glucose). With Type 2 diabetes, your body either 
resists the effects of insulin or doesn't produce enough insulin to maintain 
normal glucose levels. Proper nutrition plays a crucial role in managing this 
condition... [300 more words]

Category: Clinical
Applies To: ☑ All Practices
Tags: diabetes, diet, nutrition, blood sugar, meal planning
Audience: Adults with Type 2 Diabetes
Condition/Topic: Diabetes Management
Language: English
Review Date: December 1, 2026
Author: Dr. Jennifer Martinez
Source: Internal - Endocrinology Team
```

### Example 2: Practice-Specific Article
```
Title: Preparing Your Child for Their First Visit
Article Body: Bringing your child to their first doctor's visit can be both 
exciting and nerve-wracking. At Westside Pediatrics, we want to make sure your 
child feels comfortable and safe. Here are some tips to prepare... [200 more words]

Category: Clinical
Applies To: 
  ☐ All Practices
  ☑ Select specific practices:
      ☑ Westside Pediatrics
Tags: pediatric, first visit, children, preparation
Audience: Parents and Caregivers
Condition/Topic: Pediatric Care
Language: English
Review Date: June 15, 2026
Author: Pediatric Nursing Team
Source: Internal
```

### Example 3: Billing Article
```
Title: Understanding Your Medical Bill
Article Body: Medical bills can seem complicated, but we're here to help you 
understand them. This guide breaks down each section of your bill and explains 
what you're being charged for... [250 more words]

Category: Billing
Applies To: ☑ All Practices
Tags: billing, insurance, payment, explanation, charges
Audience: All Patients
Condition/Topic: Billing and Insurance
Language: English, Spanish
Review Date: March 30, 2026
Author: Billing Department
Source: Internal
```

---

## Workflow Diagram

```
1. Click "Import Article" button
        ↓
2. Dialog opens with empty form
        ↓
3. Fill required fields:
   • Title ✓
   • Article Body ✓
        ↓
4. AI Preview appears automatically
   (shows how patients will see it)
        ↓
5. Fill optional metadata:
   • Category
   • Applies To
   • Tags
   • Audience
   • Condition/Topic
   • Language
   • Review Date
   • Author
   • Source
        ↓
6. Review AI Preview:
   • Check title display
   • Check summary (first 200 chars)
   • Verify practice badges
        ↓
7. Click "Import Article" button
        ↓
8. Article saved to knowledge base
        ↓
9. Success alert: "Patient Education Article imported successfully!"
        ↓
10. Dialog closes
        ↓
11. Form resets (clean slate)
        ↓
12. Article appears in knowledge table
```

---

## Validation States

### Initial State (Import Button Disabled)
```
Title:    [empty]          ← Required!
Body:     [empty]          ← Required!
Button:   [✓ Import Article] (GRAY/DISABLED)
```

### Partially Filled (Import Button Still Disabled)
```
Title:    Managing Diabetes ✓
Body:     [empty]          ← Still need this!
Button:   [✓ Import Article] (GRAY/DISABLED)
```

### Ready to Import (Import Button Enabled)
```
Title:    Managing Diabetes ✓
Body:     Type 2 diabetes is... ✓
Button:   [✓ Import Article] (BLUE/ACTIVE)
AI Preview: [Shows preview] ✓
```

---

## Special Features

### Practice Selection - Expanded View
```
Applies To
┌──────────────────────────────────────┐
│ ☐ All Practices                      │
│   [Organization-wide]                │
│                                      │
│ ☑ Select specific practices:         │
│   ┌────────────────────────────────┐ │
│   │ ☑ Main Street Family Practice  │ │
│   │ ☐ Downtown Medical Center      │ │
│   │ ☑ Westside Pediatrics          │ │
│   │ ☐ Eastside Urgent Care         │ │
│   │ ☐ Northside Specialty Care     │ │
│   │ ☐ Southside Womens Health      │ │
│   └────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### Category Dropdown
```
┌──────────────────────────────────────┐
│ ▼ Clinical                           │
└──────────────────────────────────────┘
    ↓ (when clicked)
┌──────────────────────────────────────┐
│ Billing                              │
│ Clinical              ← selected     │
│ Scheduling                           │
│ General                              │
└──────────────────────────────────────┘
```

### Language Dropdown
```
┌──────────────────────────────────────┐
│ ▼ English                            │
└──────────────────────────────────────┘
    ↓ (when clicked)
┌──────────────────────────────────────┐
│ English               ← selected     │
│ Spanish                              │
│ French                               │
│ German                               │
│ Chinese                              │
└──────────────────────────────────────┘
```

---

## After Import Success

### Alert Message
```
┌─────────────────────────────────────────────┐
│  ✓ Patient Education Article imported      │
│    successfully!                            │
│                            [OK]             │
└─────────────────────────────────────────────┘
```

### Article Appears in Knowledge Table
```
┌────────────────────────────────────────────────────────────────┐
│ Question                      Category   Applies To   Version  │
├────────────────────────────────────────────────────────────────┤
│ Managing Type 2 Diabetes     [Clinical]  All Practices  v1.0   │
│ with Diet                                                       │
│ Type 2 diabetes is a chronic...                               │
│                                          [History] [Edit] [Del] │
└────────────────────────────────────────────────────────────────┘
```

---

**Status:** ✅ Ready to Use!
**Component:** TenantKnowledgeHub.tsx
**Access:** Demo Hub → Tenant Knowledge Hub → Import Article
