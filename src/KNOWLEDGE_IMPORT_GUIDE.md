# Knowledge Base Import Guide

## ✅ Import Feature is Now Working!

The Practice Knowledge Import feature has been fully implemented. You can now bulk import knowledge articles from CSV or JSON files.

---

## 🚀 How to Use

### Step 1: Navigate to Knowledge Hub
1. Go to **Demo Hub** → **Tenant Knowledge Hub**
2. Click the **"Import"** button (next to "Add Knowledge Source")

### Step 2: Prepare Your File

Choose either **CSV** or **JSON** format:

#### CSV Format
Download the sample: `/knowledge-import-sample.csv`

```csv
question,answer,category,appliesTo,tags
"What are your hours?","Mon-Fri 8AM-6PM",general,all,"hours, schedule"
"Do you accept insurance?","Yes we accept all major insurers",billing,all,"insurance, billing"
```

**Required columns:**
- `question` - The question patients will ask
- `answer` - The response the AI should give

**Optional columns:**
- `category` - `general`, `clinical`, `scheduling`, or `billing` (default: general)
- `appliesTo` - `all` or specific practice ID (default: all)
- `tags` - Comma-separated keywords

#### JSON Format
Download the sample: `/knowledge-import-sample.json`

```json
[
  {
    "question": "What are your hours?",
    "answer": "Monday-Friday 8AM-6PM, Saturday 9AM-1PM",
    "category": "general",
    "appliesTo": "all",
    "tags": "hours, schedule, availability"
  }
]
```

### Step 3: Upload & Import

1. **Click** the upload area or **drag and drop** your file
2. The system will **parse** and **validate** your file
3. **Preview** the articles that will be imported
4. Click **"Confirm Import"** to add them to your knowledge base

---

## 📋 File Format Requirements

### Required Fields
| Field | Description | Example |
|-------|-------------|---------|
| `question` | The question or topic | "What are your office hours?" |
| `answer` | The AI response content | "Monday-Friday: 7:00 AM - 7:00 PM..." |

### Optional Fields
| Field | Description | Options/Example |
|-------|-------------|-----------------|
| `category` | Knowledge category | `general`, `clinical`, `scheduling`, `billing` |
| `appliesTo` | Practice scope | `all` or practice ID like `practice-001` |
| `tags` | Search keywords | "hours, schedule, availability" |

---

## 📁 Sample Files Included

### 1. `/knowledge-import-sample.csv`
- **5 sample articles** in CSV format
- Covers general, scheduling, and billing categories
- Ready to import for testing

### 2. `/knowledge-import-sample.json`
- **8 sample articles** in JSON format
- Includes both organization-wide and practice-specific articles
- Demonstrates all available fields

---

## ✨ Features

### Automatic Validation
- ✅ Filters out rows missing `question` or `answer`
- ✅ Sets default category to `general` if not specified
- ✅ Handles missing optional fields gracefully

### Preview Before Import
- 📊 See all articles in a table view
- 📝 Review questions, answers, and categories
- ✏️ Verify before confirming

### Instant Integration
- 🔄 Imported articles appear immediately in the knowledge table
- 🏷️ Automatically versioned as v1.0
- 📅 Timestamped with current date
- 👤 Attributed to current admin user

### Bulk Import
- 📦 Import dozens or hundreds of articles at once
- ⚡ Much faster than adding one-by-one
- 🎯 Perfect for initial setup or migrations

---

## 🎯 Use Cases

### 1. Initial Practice Setup
Import your entire FAQ database at once when setting up a new practice.

### 2. Knowledge Base Migration
Move existing FAQs from another system into BASE Admin Hub.

### 3. Multi-Practice Deployment
Create organization-wide knowledge sources that apply to all practices.

### 4. Specialty-Specific Content
Import pediatric FAQs for pediatrics practice, urgent care FAQs for UC locations, etc.

---

## 🔧 Technical Details

### Supported File Types
- **.csv** - Comma-separated values
- **.json** - JavaScript Object Notation

### File Size
- No explicit limit (browser memory constrained)
- Recommended: Under 1000 articles per file

### Parsing Logic
- **CSV**: Splits on commas, trims whitespace
- **JSON**: Standard JSON.parse()
- **Validation**: Filters rows without question+answer

### Data Mapping
```javascript
{
  id: auto-generated,
  organizationId: 'org-001',
  appliesTo: from file or 'all',
  question: from file,
  answer: from file,
  category: from file or 'general',
  version: '1.0',
  status: 'active',
  createdBy: 'admin@practice.com',
  createdAt: current date,
  updatedAt: current date,
  versionHistory: [{version: '1.0', ...}],
  tags: split from file or [],
  languages: ['en']
}
```

---

## 🛠️ Troubleshooting

### Import button doesn't respond
- **Check:** Is the dialog actually opening? Make sure you click "Import" not "Add Knowledge Source"
- **Try:** Refresh the page and try again

### File parsing error
- **Check:** File format matches requirements exactly
- **CSV:** Make sure headers match: `question,answer,category,appliesTo,tags`
- **JSON:** Validate JSON syntax at jsonlint.com
- **Try:** Use the sample files first to verify the system works

### Articles not showing after import
- **Check:** Selected practice filter - imported articles may be practice-specific
- **Check:** Category filter - try "All" categories
- **Check:** Browser console for errors
- **Try:** Refresh the page

### Preview shows 0 articles
- **Check:** File has required fields (`question` and `answer`)
- **Check:** CSV headers are correct
- **Check:** File is not empty
- **Try:** Sample files to verify system works

---

## 💡 Best Practices

### 1. Start Small
- Test with 5-10 articles first
- Verify they import correctly
- Then do bulk import

### 2. Categorize Properly
- Use correct category for better organization
- Helps patients get relevant answers faster
- Makes knowledge base more maintainable

### 3. Write Clear Answers
- Be concise (2-3 sentences ideal)
- Include actionable information
- Provide contact info when needed

### 4. Use Descriptive Tags
- 3-5 tags per article
- Use common search terms
- Think about how patients will search

### 5. Test After Import
- Use the "Test AI Response" feature
- Try asking questions from your imported articles
- Verify AI gives correct responses

---

## 🎓 Example Workflow

```
1. Prepare CSV file with 50 FAQs
   ↓
2. Click Import button
   ↓
3. Upload CSV file
   ↓
4. Review preview (50 articles)
   ↓
5. Click "Confirm Import"
   ↓
6. Success! 50 articles added
   ↓
7. Test AI with sample questions
   ↓
8. Adjust/edit individual articles as needed
```

---

## 📞 Need Help?

The import feature is fully functional and ready to use! If you encounter issues:

1. Check the browser console for error messages
2. Try the sample files first
3. Verify your file format matches the requirements
4. Make sure you have both `question` and `answer` fields

---

**Last Updated:** November 26, 2025
**Status:** ✅ Fully Functional
