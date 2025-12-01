export default function handler(req: any, res: any) {
  const data = {
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
  };

  res.status(200).json(data);
}
