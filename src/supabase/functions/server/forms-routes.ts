import { Hono } from "npm:hono";

export function addFormsRoutes(app: Hono) {
  // Forms & Checklists Mock Data Endpoints
  app.get("/make-server-66fdb7c0/api/forms", (c) => {
    return c.json({
      "forms": [
        {
          "id": "Q-001",
          "name": "New Patient Intake",
          "type": "Questionnaire",
          "category": "Registration",
          "status": "active",
          "version": "2.1",
          "description": "Comprehensive intake form for new patients",
          "estimatedTime": "15-20 minutes",
          "sections": 5,
          "questions": 28,
          "languages": ["English", "Spanish"],
          "requiredFor": ["First Visit", "New Patient"],
          "lastUpdated": "November 15, 2025",
          "createdBy": "Dr. Sarah Chen"
        },
        {
          "id": "Q-002",
          "name": "Financial Consent",
          "type": "Consent",
          "category": "Financial",
          "status": "active",
          "version": "1.5",
          "description": "Financial responsibility and payment terms agreement",
          "estimatedTime": "5 minutes",
          "sections": 3,
          "questions": 8,
          "languages": ["English", "Spanish", "Chinese"],
          "requiredFor": ["All Visits", "Registration"],
          "lastUpdated": "October 22, 2025",
          "createdBy": "Admin Team"
        },
        {
          "id": "Q-003",
          "name": "HIPAA Privacy Consent",
          "type": "Consent",
          "category": "Legal",
          "status": "active",
          "version": "3.0",
          "description": "HIPAA privacy practices acknowledgment",
          "estimatedTime": "3 minutes",
          "sections": 2,
          "questions": 4,
          "languages": ["English", "Spanish"],
          "requiredFor": ["All Visits", "Registration"],
          "lastUpdated": "November 1, 2025",
          "createdBy": "Legal Department"
        },
        {
          "id": "Q-004",
          "name": "COVID-19 Screening",
          "type": "Screening",
          "category": "Clinical",
          "status": "active",
          "version": "1.8",
          "description": "Pre-visit COVID-19 symptom screening",
          "estimatedTime": "2 minutes",
          "sections": 1,
          "questions": 6,
          "languages": ["English", "Spanish"],
          "requiredFor": ["In-Person Visits"],
          "lastUpdated": "September 10, 2025",
          "createdBy": "Clinical Team"
        },
        {
          "id": "Q-005",
          "name": "Medication History",
          "type": "Questionnaire",
          "category": "Clinical",
          "status": "active",
          "version": "2.0",
          "description": "Current medications, allergies, and pharmacy information",
          "estimatedTime": "10 minutes",
          "sections": 3,
          "questions": 15,
          "languages": ["English", "Spanish"],
          "requiredFor": ["First Visit", "Annual Review"],
          "lastUpdated": "November 10, 2025",
          "createdBy": "Dr. Michael Torres"
        },
        {
          "id": "Q-006",
          "name": "Mental Health Assessment (PHQ-9)",
          "type": "Assessment",
          "category": "Mental Health",
          "status": "active",
          "version": "1.0",
          "description": "Patient Health Questionnaire for depression screening",
          "estimatedTime": "5 minutes",
          "sections": 1,
          "questions": 9,
          "languages": ["English", "Spanish"],
          "requiredFor": ["Mental Health Visits"],
          "lastUpdated": "August 15, 2025",
          "createdBy": "Dr. Lisa Wong"
        },
        {
          "id": "Q-007",
          "name": "Surgical Consent",
          "type": "Consent",
          "category": "Surgical",
          "status": "active",
          "version": "4.2",
          "description": "Pre-operative consent and risk acknowledgment",
          "estimatedTime": "10 minutes",
          "sections": 4,
          "questions": 12,
          "languages": ["English", "Spanish"],
          "requiredFor": ["Surgical Procedures"],
          "lastUpdated": "November 18, 2025",
          "createdBy": "Surgical Department"
        },
        {
          "id": "Q-008",
          "name": "Post-Visit Satisfaction Survey",
          "type": "Survey",
          "category": "Quality",
          "status": "active",
          "version": "1.3",
          "description": "Patient experience and satisfaction feedback",
          "estimatedTime": "3 minutes",
          "sections": 2,
          "questions": 10,
          "languages": ["English", "Spanish"],
          "requiredFor": ["Post-Visit"],
          "lastUpdated": "October 5, 2025",
          "createdBy": "Quality Team"
        }
      ],
      "categories": [
        "Registration",
        "Financial",
        "Legal",
        "Clinical",
        "Mental Health",
        "Surgical",
        "Quality"
      ],
      "types": [
        "Questionnaire",
        "Consent",
        "Screening",
        "Assessment",
        "Survey"
      ]
    });
  });

  app.get("/make-server-66fdb7c0/api/checklists", (c) => {
    return c.json({
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
    });
  });

  app.get("/make-server-66fdb7c0/api/providers", (c) => {
    return c.json({
      "providers": [
        {
          "id": "prov-001",
          "name": "Dr. Sarah Chen",
          "credentials": "MD, FACP",
          "specialty": "Internal Medicine",
          "department": "Primary Care",
          "npi": "1234567890",
          "email": "schen@greenwayhealth.com",
          "phone": "(555) 123-4567",
          "locations": ["LOC-001", "LOC-002"],
          "status": "active",
          "acceptingNewPatients": true
        },
        {
          "id": "prov-002",
          "name": "Dr. Michael Torres",
          "credentials": "MD, FACC",
          "specialty": "Cardiology",
          "department": "Cardiology",
          "npi": "2345678901",
          "email": "mtorres@greenwayhealth.com",
          "phone": "(555) 234-5678",
          "locations": ["LOC-001", "LOC-003"],
          "status": "active",
          "acceptingNewPatients": true
        },
        {
          "id": "prov-003",
          "name": "Dr. Lisa Wong",
          "credentials": "MD, PhD",
          "specialty": "Psychiatry",
          "department": "Mental Health",
          "npi": "3456789012",
          "email": "lwong@greenwayhealth.com",
          "phone": "(555) 345-6789",
          "locations": ["LOC-002", "LOC-004"],
          "status": "active",
          "acceptingNewPatients": false
        },
        {
          "id": "prov-004",
          "name": "Dr. James Anderson",
          "credentials": "MD, FACS",
          "specialty": "General Surgery",
          "department": "Surgery",
          "npi": "4567890123",
          "email": "janderson@greenwayhealth.com",
          "phone": "(555) 456-7890",
          "locations": ["LOC-001"],
          "status": "active",
          "acceptingNewPatients": true
        },
        {
          "id": "prov-005",
          "name": "Dr. Emily Rodriguez",
          "credentials": "DO",
          "specialty": "Family Medicine",
          "department": "Primary Care",
          "npi": "5678901234",
          "email": "erodriguez@greenwayhealth.com",
          "phone": "(555) 567-8901",
          "locations": ["LOC-002", "LOC-005"],
          "status": "active",
          "acceptingNewPatients": true
        },
        {
          "id": "prov-006",
          "name": "Dr. Robert Kim",
          "credentials": "MD, FACOG",
          "specialty": "Obstetrics & Gynecology",
          "department": "Women's Health",
          "npi": "6789012345",
          "email": "rkim@greenwayhealth.com",
          "phone": "(555) 678-9012",
          "locations": ["LOC-003", "LOC-004"],
          "status": "active",
          "acceptingNewPatients": true
        },
        {
          "id": "prov-007",
          "name": "Dr. Patricia Johnson",
          "credentials": "MD, FAAP",
          "specialty": "Pediatrics",
          "department": "Pediatrics",
          "npi": "7890123456",
          "email": "pjohnson@greenwayhealth.com",
          "phone": "(555) 789-0123",
          "locations": ["LOC-005"],
          "status": "active",
          "acceptingNewPatients": true
        },
        {
          "id": "prov-008",
          "name": "Dr. David Lee",
          "credentials": "MD",
          "specialty": "Orthopedic Surgery",
          "department": "Orthopedics",
          "npi": "8901234567",
          "email": "dlee@greenwayhealth.com",
          "phone": "(555) 890-1234",
          "locations": ["LOC-001", "LOC-003"],
          "status": "active",
          "acceptingNewPatients": false
        }
      ]
    });
  });

  app.get("/make-server-66fdb7c0/api/locations", (c) => {
    return c.json({
      "locations": [
        {
          "id": "LOC-001",
          "name": "Greenway Health - Main Campus",
          "type": "Hospital",
          "address": {
            "street": "1234 Medical Center Drive",
            "city": "Tampa",
            "state": "FL",
            "zip": "33602",
            "country": "USA"
          },
          "phone": "(813) 555-1000",
          "fax": "(813) 555-1001",
          "email": "main@greenwayhealth.com",
          "departments": ["Primary Care", "Cardiology", "Surgery", "Orthopedics"],
          "services": ["Inpatient", "Outpatient", "Emergency", "Laboratory", "Imaging"],
          "hours": {
            "monday": "7:00 AM - 8:00 PM",
            "tuesday": "7:00 AM - 8:00 PM",
            "wednesday": "7:00 AM - 8:00 PM",
            "thursday": "7:00 AM - 8:00 PM",
            "friday": "7:00 AM - 8:00 PM",
            "saturday": "8:00 AM - 5:00 PM",
            "sunday": "Closed"
          },
          "parking": "Free parking available",
          "accessibility": "Wheelchair accessible, ADA compliant",
          "status": "active"
        },
        {
          "id": "LOC-002",
          "name": "Greenway Health - Westshore Clinic",
          "type": "Clinic",
          "address": {
            "street": "5678 Bay Boulevard",
            "city": "Tampa",
            "state": "FL",
            "zip": "33607",
            "country": "USA"
          },
          "phone": "(813) 555-2000",
          "fax": "(813) 555-2001",
          "email": "westshore@greenwayhealth.com",
          "departments": ["Primary Care", "Mental Health"],
          "services": ["Outpatient", "Laboratory"],
          "hours": {
            "monday": "8:00 AM - 6:00 PM",
            "tuesday": "8:00 AM - 6:00 PM",
            "wednesday": "8:00 AM - 6:00 PM",
            "thursday": "8:00 AM - 6:00 PM",
            "friday": "8:00 AM - 5:00 PM",
            "saturday": "Closed",
            "sunday": "Closed"
          },
          "parking": "Validated parking in adjacent garage",
          "accessibility": "Wheelchair accessible",
          "status": "active"
        },
        {
          "id": "LOC-003",
          "name": "Greenway Health - Brandon Medical Center",
          "type": "Medical Center",
          "address": {
            "street": "9012 Providence Road",
            "city": "Brandon",
            "state": "FL",
            "zip": "33511",
            "country": "USA"
          },
          "phone": "(813) 555-3000",
          "fax": "(813) 555-3001",
          "email": "brandon@greenwayhealth.com",
          "departments": ["Cardiology", "Women's Health", "Orthopedics"],
          "services": ["Outpatient", "Surgery Center", "Laboratory", "Imaging"],
          "hours": {
            "monday": "7:00 AM - 7:00 PM",
            "tuesday": "7:00 AM - 7:00 PM",
            "wednesday": "7:00 AM - 7:00 PM",
            "thursday": "7:00 AM - 7:00 PM",
            "friday": "7:00 AM - 6:00 PM",
            "saturday": "8:00 AM - 2:00 PM",
            "sunday": "Closed"
          },
          "parking": "Free parking",
          "accessibility": "Wheelchair accessible, automatic doors",
          "status": "active"
        },
        {
          "id": "LOC-004",
          "name": "Greenway Health - Carrollwood Family Practice",
          "type": "Clinic",
          "address": {
            "street": "3456 Dale Mabry Highway",
            "city": "Tampa",
            "state": "FL",
            "zip": "33618",
            "country": "USA"
          },
          "phone": "(813) 555-4000",
          "fax": "(813) 555-4001",
          "email": "carrollwood@greenwayhealth.com",
          "departments": ["Mental Health", "Women's Health"],
          "services": ["Outpatient"],
          "hours": {
            "monday": "9:00 AM - 5:00 PM",
            "tuesday": "9:00 AM - 5:00 PM",
            "wednesday": "9:00 AM - 5:00 PM",
            "thursday": "9:00 AM - 5:00 PM",
            "friday": "9:00 AM - 4:00 PM",
            "saturday": "Closed",
            "sunday": "Closed"
          },
          "parking": "Street parking and lot",
          "accessibility": "Wheelchair accessible",
          "status": "active"
        },
        {
          "id": "LOC-005",
          "name": "Greenway Health - South Tampa Pediatrics",
          "type": "Clinic",
          "address": {
            "street": "7890 South Dale Mabry",
            "city": "Tampa",
            "state": "FL",
            "zip": "33629",
            "country": "USA"
          },
          "phone": "(813) 555-5000",
          "fax": "(813) 555-5001",
          "email": "pediatrics@greenwayhealth.com",
          "departments": ["Pediatrics", "Primary Care"],
          "services": ["Outpatient", "Vaccinations"],
          "hours": {
            "monday": "8:00 AM - 6:00 PM",
            "tuesday": "8:00 AM - 6:00 PM",
            "wednesday": "8:00 AM - 6:00 PM",
            "thursday": "8:00 AM - 6:00 PM",
            "friday": "8:00 AM - 5:00 PM",
            "saturday": "9:00 AM - 1:00 PM",
            "sunday": "Closed"
          },
          "parking": "Free parking",
          "accessibility": "Wheelchair accessible, family-friendly",
          "status": "active"
        }
      ]
    });
  });

  app.get("/make-server-66fdb7c0/api/task-instances", (c) => {
    return c.json({
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "patientName": "John Smith",
      "appointmentId": "appt-2025-11-30-001",
      "appointmentDate": "November 30, 2025",
      "appointmentTime": "2:00 PM",
      "provider": "Dr. Sarah Chen",
      "location": "Greenway Health - Main Campus",
      "generatedDate": "November 24, 2025",
      "tasks": [
        {
          "id": "task-inst-001",
          "taskId": "task-001",
          "title": "Complete New Patient Intake Form",
          "description": "Fill out demographic, medical history, and insurance information",
          "formId": "Q-001",
          "formName": "New Patient Intake",
          "required": true,
          "status": "pending",
          "dueDate": "November 28, 2025",
          "estimatedTime": "15-20 minutes",
          "completedDate": null,
          "order": 1
        },
        {
          "id": "task-inst-002",
          "taskId": "task-002",
          "title": "Sign Financial Consent",
          "description": "Review and agree to financial responsibility terms",
          "formId": "Q-002",
          "formName": "Financial Consent",
          "required": true,
          "status": "pending",
          "dueDate": "November 28, 2025",
          "estimatedTime": "5 minutes",
          "completedDate": null,
          "order": 2
        },
        {
          "id": "task-inst-003",
          "taskId": "task-003",
          "title": "Acknowledge HIPAA Privacy Practices",
          "description": "Review privacy practices and sign consent",
          "formId": "Q-003",
          "formName": "HIPAA Privacy Consent",
          "required": true,
          "status": "pending",
          "dueDate": "November 28, 2025",
          "estimatedTime": "3 minutes",
          "completedDate": null,
          "order": 3
        },
        {
          "id": "task-inst-004",
          "taskId": "task-004",
          "title": "Upload Insurance Card (Front & Back)",
          "description": "Take photos of both sides of your insurance card",
          "formId": null,
          "required": true,
          "status": "pending",
          "dueDate": "November 29, 2025",
          "estimatedTime": "2 minutes",
          "completedDate": null,
          "order": 4
        },
        {
          "id": "task-inst-005",
          "taskId": "task-005",
          "title": "Upload Photo ID",
          "description": "Driver's license or government-issued ID",
          "formId": null,
          "required": true,
          "status": "pending",
          "dueDate": "November 29, 2025",
          "estimatedTime": "1 minute",
          "completedDate": null,
          "order": 5
        },
        {
          "id": "task-inst-006",
          "taskId": "task-006",
          "title": "Complete COVID-19 Screening",
          "description": "Answer symptom screening questions",
          "formId": "Q-004",
          "formName": "COVID-19 Screening",
          "required": true,
          "status": "pending",
          "dueDate": "November 30, 2025",
          "estimatedTime": "2 minutes",
          "completedDate": null,
          "order": 6
        }
      ],
      "summary": {
        "total": 6,
        "completed": 0,
        "pending": 6,
        "required": 6,
        "optional": 0
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/patient-checklist", (c) => {
    return c.json({
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
            "completed": false,
            "completedDate": null,
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
            "completed": false,
            "completedDate": null,
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
          "completed": 0,
          "remaining": 6,
          "estimatedTimeRemaining": "28-33 minutes"
        }
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/patient-checklist-updated", (c) => {
    return c.json({
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
    });
  });

  app.get("/make-server-66fdb7c0/api/complete-task-T1101", (c) => {
    return c.json({
      "success": true,
      "message": "Task T-1101 (Complete New Patient Intake Form) marked as completed",
      "taskId": "item-001",
      "completedDate": "November 24, 2025",
      "completedTime": "3:45 PM",
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "response": {
        "taskId": "item-001",
        "title": "Complete New Patient Intake Form",
        "status": "completed",
        "completedDate": "November 24, 2025",
        "completedBy": "John Smith",
        "responseId": "resp-001",
        "formId": "Q-001",
        "formName": "New Patient Intake"
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/complete-task-T1102", (c) => {
    return c.json({
      "success": true,
      "message": "Task T-1102 (Sign Financial Consent) marked as completed",
      "taskId": "item-002",
      "completedDate": "November 24, 2025",
      "completedTime": "3:50 PM",
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "response": {
        "taskId": "item-002",
        "title": "Sign Financial Consent",
        "status": "completed",
        "completedDate": "November 24, 2025",
        "completedBy": "John Smith",
        "responseId": "resp-002",
        "formId": "Q-002",
        "formName": "Financial Consent"
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/complete-task-T1103", (c) => {
    return c.json({
      "success": true,
      "message": "Task T-1103 (Acknowledge HIPAA Privacy Notice) marked as completed",
      "taskId": "item-003",
      "completedDate": "November 24, 2025",
      "completedTime": "3:55 PM",
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "response": {
        "taskId": "item-003",
        "title": "Acknowledge HIPAA Privacy Notice",
        "status": "completed",
        "completedDate": "November 24, 2025",
        "completedBy": "John Smith",
        "responseId": "resp-003",
        "formId": "Q-003",
        "formName": "HIPAA Privacy Consent"
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/complete-task-T1104", (c) => {
    return c.json({
      "success": true,
      "message": "Task T-1104 (Upload Insurance Card) marked as completed",
      "taskId": "item-004",
      "completedDate": "November 24, 2025",
      "completedTime": "4:00 PM",
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "response": {
        "taskId": "item-004",
        "title": "Upload Insurance Card",
        "status": "completed",
        "completedDate": "November 24, 2025",
        "completedBy": "John Smith",
        "responseId": "resp-004",
        "formId": null
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/complete-task-T1105", (c) => {
    return c.json({
      "success": true,
      "message": "Task T-1105 (Upload Photo ID) marked as completed",
      "taskId": "item-005",
      "completedDate": "November 24, 2025",
      "completedTime": "4:02 PM",
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "response": {
        "taskId": "item-005",
        "title": "Upload Photo ID",
        "status": "completed",
        "completedDate": "November 24, 2025",
        "completedBy": "John Smith",
        "responseId": "resp-005",
        "formId": null
      }
    });
  });

  app.get("/make-server-66fdb7c0/api/complete-task-T1106", (c) => {
    return c.json({
      "success": true,
      "message": "Task T-1106 (Complete COVID-19 Screening) marked as completed",
      "taskId": "item-006",
      "completedDate": "November 24, 2025",
      "completedTime": "4:05 PM",
      "patientId": "0efed85b-e8a2-417b-a1f4-6a30fd74e7c2",
      "response": {
        "taskId": "item-006",
        "title": "Complete COVID-19 Screening",
        "status": "completed",
        "completedDate": "November 24, 2025",
        "completedBy": "John Smith",
        "responseId": "resp-006",
        "formId": "Q-004",
        "formName": "COVID-19 Screening"
      }
    });
  });
}