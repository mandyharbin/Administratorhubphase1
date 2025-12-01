export default function handler(req: any, res: any) {
  const data = {
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
  };

  res.status(200).json(data);
}
