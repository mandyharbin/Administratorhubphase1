export default function handler(req: any, res: any) {
  const data = {
    "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
    "patientName": "John Smith",
    "upcomingAppointment": {
      "id": "appt-2025-11-30-001",
      "date": "November 30, 2025",
      "time": "2:00 PM",
      "provider": "Dr. Sarah Chen",
      "specialty": "Internal Medicine",
      "location": "Greenway Health - Main Campus",
      "address": "1234 Medical Center Drive, Tampa, FL 33602",
      "visitType": "First Visit",
      "visitReason": "Annual Physical"
    },
    "checklist": {
      "title": "Pre-Visit To-Do List",
      "description": "Please complete these tasks before your appointment",
      "dueDate": "November 29, 2025",
      "items": [
        {
          "id": "item-001",
          "title": "Complete New Patient Intake Form",
          "description": "Provide your medical history, current medications, and insurance details",
          "type": "form",
          "formId": "Q-001",
          "formName": "New Patient Intake",
          "required": true,
          "completed": true,
          "completedDate": "November 24, 2025",
          "estimatedTime": "15-20 minutes",
          "icon": "FileText",
          "priority": "high"
        },
        {
          "id": "item-002",
          "title": "Sign Financial Consent",
          "description": "Review payment policies and sign financial agreement",
          "type": "form",
          "formId": "Q-002",
          "formName": "Financial Consent",
          "required": true,
          "completed": true,
          "completedDate": "November 24, 2025",
          "estimatedTime": "5 minutes",
          "icon": "DollarSign",
          "priority": "high"
        },
        {
          "id": "item-003",
          "title": "Acknowledge HIPAA Privacy Notice",
          "description": "Review our privacy practices",
          "type": "form",
          "formId": "Q-003",
          "formName": "HIPAA Privacy Consent",
          "required": true,
          "completed": false,
          "completedDate": null,
          "estimatedTime": "3 minutes",
          "icon": "Shield",
          "priority": "high"
        },
        {
          "id": "item-004",
          "title": "Upload Insurance Card",
          "description": "Photos of front and back",
          "type": "upload",
          "formId": null,
          "required": true,
          "completed": false,
          "completedDate": null,
          "estimatedTime": "2 minutes",
          "icon": "CreditCard",
          "priority": "medium"
        },
        {
          "id": "item-005",
          "title": "Upload Photo ID",
          "description": "Driver's license or state ID",
          "type": "upload",
          "formId": null,
          "required": true,
          "completed": false,
          "completedDate": null,
          "estimatedTime": "1 minute",
          "icon": "IdCard",
          "priority": "medium"
        },
        {
          "id": "item-006",
          "title": "Complete COVID-19 Screening",
          "description": "Required before in-person visits",
          "type": "form",
          "formId": "Q-004",
          "formName": "COVID-19 Screening",
          "required": true,
          "completed": false,
          "completedDate": null,
          "estimatedTime": "2 minutes",
          "icon": "Activity",
          "priority": "high"
        }
      ],
      "summary": {
        "total": 6,
        "completed": 2,
        "remaining": 4,
        "estimatedTimeRemaining": "8-11 minutes"
      }
    }
  };

  res.status(200).json(data);
}
