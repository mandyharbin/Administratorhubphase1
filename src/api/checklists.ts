export default function handler(req: any, res: any) {
  const data = {
    "checklists": [
      {
        "id": "CL-001",
        "name": "New Patient Registration",
        "description": "Complete checklist for onboarding new patients",
        "category": "Registration",
        "status": "active",
        "estimatedTime": "30-40 minutes",
        "tasks": [
          {
            "id": "task-001",
            "title": "Complete New Patient Intake Form",
            "description": "Fill out demographic, medical history, and insurance information",
            "formId": "Q-001",
            "formName": "New Patient Intake",
            "required": true,
            "order": 1,
            "estimatedTime": "15-20 minutes"
          },
          {
            "id": "task-002",
            "title": "Sign Financial Consent",
            "description": "Review and agree to financial responsibility terms",
            "formId": "Q-002",
            "formName": "Financial Consent",
            "required": true,
            "order": 2,
            "estimatedTime": "5 minutes"
          },
          {
            "id": "task-003",
            "title": "Acknowledge HIPAA Privacy Practices",
            "description": "Review privacy practices and sign consent",
            "formId": "Q-003",
            "formName": "HIPAA Privacy Consent",
            "required": true,
            "order": 3,
            "estimatedTime": "3 minutes"
          },
          {
            "id": "task-004",
            "title": "Upload Insurance Card (Front & Back)",
            "description": "Take photos of both sides of your insurance card",
            "formId": null,
            "required": true,
            "order": 4,
            "estimatedTime": "2 minutes"
          },
          {
            "id": "task-005",
            "title": "Upload Photo ID",
            "description": "Driver's license or government-issued ID",
            "formId": null,
            "required": true,
            "order": 5,
            "estimatedTime": "1 minute"
          }
        ],
        "appliesTo": ["First Visit"],
        "createdBy": "Admin Team",
        "lastUpdated": "November 15, 2025"
      },
      {
        "id": "CL-002",
        "name": "Pre-Visit Preparation",
        "description": "Standard checklist for all upcoming appointments",
        "category": "Pre-Visit",
        "status": "active",
        "estimatedTime": "10-15 minutes",
        "tasks": [
          {
            "id": "task-006",
            "title": "Complete COVID-19 Screening",
            "description": "Answer symptom screening questions",
            "formId": "Q-004",
            "formName": "COVID-19 Screening",
            "required": true,
            "order": 1,
            "estimatedTime": "2 minutes"
          },
          {
            "id": "task-007",
            "title": "Update Medication List",
            "description": "Review and update current medications",
            "formId": "Q-005",
            "formName": "Medication History",
            "required": false,
            "order": 2,
            "estimatedTime": "5 minutes"
          },
          {
            "id": "task-008",
            "title": "Review Appointment Details",
            "description": "Confirm date, time, and location",
            "formId": null,
            "required": false,
            "order": 3,
            "estimatedTime": "1 minute"
          },
          {
            "id": "task-009",
            "title": "Prepare Questions for Doctor",
            "description": "Write down any symptoms or concerns to discuss",
            "formId": null,
            "required": false,
            "order": 4,
            "estimatedTime": "5 minutes"
          }
        ],
        "appliesTo": ["In-Person Visits", "Telehealth Visits"],
        "createdBy": "Clinical Team",
        "lastUpdated": "November 10, 2025"
      },
      {
        "id": "CL-003",
        "name": "Pre-Surgical Checklist",
        "description": "Required tasks before surgical procedures",
        "category": "Surgical",
        "status": "active",
        "estimatedTime": "25-30 minutes",
        "tasks": [
          {
            "id": "task-010",
            "title": "Sign Surgical Consent Form",
            "description": "Review procedure details and risks",
            "formId": "Q-007",
            "formName": "Surgical Consent",
            "required": true,
            "order": 1,
            "estimatedTime": "10 minutes"
          },
          {
            "id": "task-011",
            "title": "Complete Pre-Op Health Assessment",
            "description": "Medical history and current health status",
            "formId": null,
            "required": true,
            "order": 2,
            "estimatedTime": "10 minutes"
          },
          {
            "id": "task-012",
            "title": "Review Pre-Op Instructions",
            "description": "Fasting, medication, and preparation guidelines",
            "formId": null,
            "required": true,
            "order": 3,
            "estimatedTime": "5 minutes"
          },
          {
            "id": "task-013",
            "title": "Arrange Transportation",
            "description": "Confirm ride home after procedure",
            "formId": null,
            "required": true,
            "order": 4,
            "estimatedTime": "2 minutes"
          }
        ],
        "appliesTo": ["Surgical Procedures"],
        "createdBy": "Surgical Department",
        "lastUpdated": "November 18, 2025"
      },
      {
        "id": "CL-004",
        "name": "Annual Wellness Visit",
        "description": "Checklist for yearly physical examination",
        "category": "Preventive",
        "status": "active",
        "estimatedTime": "20 minutes",
        "tasks": [
          {
            "id": "task-014",
            "title": "Update Medical History",
            "description": "Review and update health conditions",
            "formId": "Q-001",
            "formName": "New Patient Intake",
            "required": true,
            "order": 1,
            "estimatedTime": "10 minutes"
          },
          {
            "id": "task-015",
            "title": "Update Medication List",
            "description": "Current medications and supplements",
            "formId": "Q-005",
            "formName": "Medication History",
            "required": true,
            "order": 2,
            "estimatedTime": "5 minutes"
          },
          {
            "id": "task-016",
            "title": "Mental Health Screening",
            "description": "PHQ-9 depression screening",
            "formId": "Q-006",
            "formName": "Mental Health Assessment (PHQ-9)",
            "required": false,
            "order": 3,
            "estimatedTime": "5 minutes"
          }
        ],
        "appliesTo": ["Annual Review"],
        "createdBy": "Dr. Sarah Chen",
        "lastUpdated": "October 30, 2025"
      }
    ],
    "categories": [
      "Registration",
      "Pre-Visit",
      "Surgical",
      "Preventive"
    ]
  };

  res.status(200).json(data);
}
