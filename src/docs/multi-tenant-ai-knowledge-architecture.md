# Multi-Tenant AI Knowledge Hub Architecture

## Overview

The AI Knowledge Hub is a comprehensive Phase 1 solution for managing tenant-specific knowledge sources that power the AI Factory Agent. This system enables each practice/tenant to maintain their own isolated knowledge base with full version control and optional MedlinePlus health education integration.

## Architecture Components

### 1. **Frontend: Tenant Knowledge Hub** (`/components/TenantKnowledgeHub.tsx`)
- Multi-tenant knowledge source management interface
- Tenant selector with configuration settings
- Knowledge source CRUD operations with versioning
- Category-based organization (General, Billing, Scheduling, Clinical)
- Version history tracking
- MedlinePlus integration toggle per tenant
- Test AI response preview

### 2. **Backend: AI Factory Agent** (`/supabase/functions/server/index.tsx`)

#### New Endpoints:

**Tenant Management:**
- `GET /tenants` - List all tenants
- `GET /tenants/:tenantId/config` - Get tenant configuration
- `POST /tenants/:tenantId/config` - Update tenant configuration

**Knowledge Sources:**
- `GET /tenants/:tenantId/knowledge-sources` - Get all knowledge sources for a tenant
- `POST /tenants/:tenantId/knowledge-sources` - Create/update knowledge source
- `DELETE /tenants/:tenantId/knowledge-sources/:id` - Delete knowledge source

**AI Chat:**
- `POST /chat-tenant` - Enhanced chat endpoint with tenant-specific knowledge

#### Data Structure:

```typescript
// Tenant Configuration
{
  tenantId: string,
  useMedlinePlus: boolean,
  autoRouting: boolean,
  languages: string[],
  createdAt: string,
  updatedAt: string
}

// Knowledge Source
{
  id: string,
  tenantId: string,
  question: string,
  answer: string,
  category: 'general' | 'billing' | 'scheduling' | 'clinical',
  version: string, // e.g., "2.1"
  status: 'active' | 'draft' | 'archived',
  createdBy: string,
  createdAt: string,
  updatedAt: string,
  versionHistory: VersionHistory[],
  tags: string[],
  languages: string[]
}

// Version History
{
  version: string,
  updatedAt: string,
  updatedBy: string,
  changes: string
}
```

### 3. **Storage Pattern**

Knowledge sources are stored in the key-value store with tenant-scoped keys:
```
knowledge:{tenantId}:{sourceId}
tenant:config:{tenantId}
```

This ensures complete data isolation between tenants.

## Key Features

### 1. **Multi-Tenant Isolation**
- Each practice/tenant has completely isolated knowledge sources
- Tenant-scoped storage keys prevent data leakage
- Per-tenant configuration settings

### 2. **Version Control**
- Automatic version incrementing (e.g., 1.0 → 1.1 → 2.0)
- Complete version history for each knowledge source
- Track who changed what and when
- View historical versions

### 3. **MedlinePlus Integration**
- Optional per-tenant enable/disable
- Automatically searches MedlinePlus for health education content
- Supplements tenant knowledge base with trusted medical information
- No API key required (free U.S. National Library of Medicine API)

### 4. **Category-Based Organization**
Knowledge sources organized by:
- **General** - Office hours, locations, contact info
- **Billing** - Insurance, payments, billing policies
- **Scheduling** - Appointments, cancellation policies
- **Clinical** - Prescriptions, lab info, medical procedures

### 5. **AI Factory Agent Integration**

The `/chat-tenant` endpoint implements the AI Factory Agent pattern:

```typescript
// Request
{
  messages: Message[],
  userMessage: string,
  patientContext: PatientContext,
  tenantId: string
}

// Response
{
  response: string,
  shouldRoute: boolean,
  detectedIntent: string | null,
  metadata: {
    tenantId: string,
    usedMedlinePlus: boolean,
    knowledgeSourcesUsed: number
  }
}
```

**How it works:**
1. Patient asks a question
2. System loads tenant configuration (MedlinePlus enabled?)
3. Loads tenant-specific knowledge sources from KV store
4. Optionally searches MedlinePlus if enabled
5. AI generates response using:
   - Tenant knowledge base (priority)
   - MedlinePlus education (supplementary)
   - Patient context (medications, appointments)
6. Returns answer or routes to staff

## Usage Examples

### Creating a Knowledge Source

```typescript
POST /make-server-66fdb7c0/tenants/tenant-001/knowledge-sources
{
  "id": "ks-123",
  "question": "What are your office hours?",
  "answer": "Monday-Friday: 7:00 AM - 7:00 PM, Saturday: 9:00 AM - 1:00 PM",
  "category": "general",
  "tags": ["hours", "schedule"],
  "languages": ["en", "es"]
}
```

### Updating a Knowledge Source (Auto-versioning)

```typescript
POST /make-server-66fdb7c0/tenants/tenant-001/knowledge-sources
{
  "id": "ks-123",
  "question": "What are your office hours?",
  "answer": "Monday-Friday: 7:00 AM - 8:00 PM, Saturday: 9:00 AM - 2:00 PM", // Updated
  "category": "general",
  "version": "1.0", // Will auto-increment to 1.1
  "createdAt": "2025-10-15T...",
  "versionHistory": [...]
}
```

### Chat with Tenant-Specific Knowledge

```typescript
POST /make-server-66fdb7c0/chat-tenant
{
  "tenantId": "tenant-001",
  "userMessage": "What are your office hours?",
  "messages": [],
  "patientContext": null
}

// Response uses tenant-001's knowledge base
{
  "response": "Our office hours are Monday-Friday: 7:00 AM - 8:00 PM, Saturday: 9:00 AM - 2:00 PM. We're closed on Sundays.",
  "shouldRoute": false,
  "detectedIntent": null,
  "metadata": {
    "tenantId": "tenant-001",
    "usedMedlinePlus": false,
    "knowledgeSourcesUsed": 5
  }
}
```

## Benefits for Phase 1

### For Practices/Tenants:
1. **Complete Control** - Each practice maintains their own knowledge base
2. **Easy Updates** - Change information without developer involvement
3. **Version History** - Track all changes and revert if needed
4. **Optional Education** - Enable MedlinePlus for enhanced patient education

### For Developers:
1. **Scalable Architecture** - Add tenants without code changes
2. **Clean Separation** - Tenant data completely isolated
3. **Easy Testing** - Switch between tenants to test different configurations
4. **API-First Design** - All functionality accessible via REST API

### For Patients:
1. **Accurate Information** - Always get the latest practice-specific info
2. **Trusted Sources** - Optional MedlinePlus health education
3. **Consistent Experience** - AI maintains conversational tone
4. **Smart Routing** - Complex questions automatically routed to staff

## Configuration Options

### Tenant Settings:
- **useMedlinePlus** - Enable/disable MedlinePlus health education
- **autoRouting** - Automatically route complex questions to staff
- **languages** - Supported languages for this tenant

### Knowledge Source Settings:
- **category** - General, Billing, Scheduling, Clinical
- **tags** - Search/filter tags
- **languages** - Which languages this source is available in
- **status** - Active, Draft, or Archived

## Future Enhancements (Phase 2+)

1. **Multi-language Support** - Automatic translation of knowledge sources
2. **Analytics** - Track which knowledge sources are most used
3. **AI-Suggested Updates** - Detect when knowledge might be outdated
4. **Bulk Import/Export** - Easy migration of knowledge bases
5. **Role-Based Access** - Different knowledge for different user roles
6. **Smart Search** - Fuzzy matching and semantic search
7. **Knowledge Graph** - Relationships between knowledge sources
8. **A/B Testing** - Test different answers to optimize patient satisfaction

## Technical Notes

### Storage Efficiency
- Uses KV store prefix pattern for fast tenant-specific queries
- Lazy loading - only loads knowledge for active tenant
- Caching strategy can be added in Phase 2

### Security
- Tenant isolation at storage level
- No cross-tenant data access possible
- All operations require tenantId

### Performance
- Knowledge sources loaded once per chat session
- MedlinePlus API calls cached (can be enhanced)
- Version history stored with source (no extra queries)

## Integration with Existing System

This multi-tenant knowledge hub integrates seamlessly with:
- **Organization & Access** - Tenant/location management
- **AI Assistant Demo** - Uses tenant knowledge in responses
- **Patient App Demo** - Real-time knowledge-based answers
- **Lexicons & Routing** - Works with existing routing rules
- **Audit Logs** - All changes tracked and auditable

## Conclusion

The Multi-Tenant AI Knowledge Hub provides a robust, scalable foundation for Phase 1 of the BASE Admin Hub. It enables each practice to maintain their own knowledge base while leveraging shared AI infrastructure and optional MedlinePlus integration for enhanced patient education.
