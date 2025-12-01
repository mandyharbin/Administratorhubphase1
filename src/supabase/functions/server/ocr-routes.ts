import { Hono } from 'npm:hono';

const ocrRoutes = new Hono();

ocrRoutes.post('/extract-form', async (c) => {
  try {
    const { imageBase64 } = await c.req.json();

    if (!imageBase64) {
      return c.json({ error: 'No image provided' }, 400);
    }

    // Try multiple possible environment variable names (same as chat endpoint)
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_NEW') || 
                         Deno.env.get('OPENAI_API_KEY') ||
                         Deno.env.get('OPENAI_KEY');
    
    console.log('Environment check:');
    console.log('- OPENAI_API_KEY exists:', !!openaiApiKey);
    console.log('- OPENAI_API_KEY length:', openaiApiKey?.length || 0);
    console.log('- OPENAI_API_KEY prefix:', openaiApiKey?.substring(0, 7) || 'not found');
    
    // Check if API key exists
    if (!openaiApiKey || openaiApiKey.trim().length === 0) {
      console.log('⚠️ No OpenAI API key found, using fallback data');
      return c.json({ 
        fields: getFallbackFields(),
        usedFallback: true,
        message: 'OpenAI API key not configured. Using sample data for demonstration.'
      });
    }

    // Validate API key format (OpenAI keys start with "sk-")
    if (!openaiApiKey.trim().startsWith('sk-')) {
      console.log('⚠️ Invalid OpenAI API key format (should start with "sk-"), using fallback data');
      return c.json({ 
        fields: getFallbackFields(),
        usedFallback: true,
        message: 'Invalid OpenAI API key format detected. Please update your API key. Using sample data for demonstration.'
      });
    }

    console.log('✓ Valid OpenAI API key format detected, making request to OpenAI Vision API...');

    // Call OpenAI Vision API - let OpenAI validate the key
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey.trim()}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting form fields from medical documents, particularly medical history forms, patient intake forms, and clinical assessments. 

Analyze the image and extract ALL form fields as a JSON array. Pay special attention to:
- Medical history questions (past conditions, surgeries, medications)
- Family history questions
- Current symptoms and complaints
- Medication lists and dosages
- Allergy information
- Social history (smoking, alcohol, exercise)
- Review of systems questions
- Vital signs fields

For each field, provide:
- text: The exact field label/question as it appears (preserve medical terminology)
- type: Field type (text, boolean, choice, date, integer)
- required: Whether it appears required (look for asterisks, "required" text, or context)
- options: For choice/checkbox fields, list ALL visible options
- fhirMapping: Appropriate FHIR path such as:
  * Patient demographics: Patient.name, Patient.birthDate, Patient.gender, Patient.address, Patient.telecom
  * Medical history: Condition.code, Condition.onsetDateTime, Condition.clinicalStatus
  * Medications: MedicationStatement.medicationCodeableConcept, MedicationStatement.dosage
  * Allergies: AllergyIntolerance.code, AllergyIntolerance.reaction
  * Observations: Observation.code, Observation.valueQuantity, Observation.valueString
  * Family history: FamilyMemberHistory.condition
  * Procedures: Procedure.code, Procedure.performedDateTime

IMPORTANT: 
- Preserve medical terminology exactly as written (e.g., "hypertension", "diabetes mellitus", "COPD")
- Extract medication names, dosages, and frequencies
- Include all checkbox options for multi-select questions
- Identify all sections: Demographics, Chief Complaint, History of Present Illness, Past Medical History, Medications, Allergies, Family History, Social History, Review of Systems

Return ONLY valid JSON array, no markdown formatting.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all form fields from this medical document. Pay special attention to medical terms, conditions, medications, and clinical history sections:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64,
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('⚠️ OpenAI API request failed, using fallback sample data');
      // Return fallback data instead of error
      return c.json({ 
        fields: getFallbackFields(),
        usedFallback: true,
        message: 'Using sample data for demonstration'
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '[]';
    
    console.log('OpenAI response received, content length:', content.length);
    
    // Parse the AI response
    let extractedData = [];
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanContent);
      console.log('Successfully parsed', extractedData.length, 'fields');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response was:', content);
      return c.json({ 
        fields: getFallbackFields(),
        usedFallback: true,
        message: 'Failed to parse OCR results, using sample data'
      });
    }

    return c.json({ fields: extractedData, usedFallback: false });

  } catch (error) {
    console.error('OCR processing error:', error);
    return c.json({ 
      fields: getFallbackFields(),
      usedFallback: true,
      message: 'Processing error, using sample data'
    });
  }
});

// Save OCR-generated form to database
ocrRoutes.post('/save-form', async (c) => {
  try {
    const formData = await c.req.json();
    
    // Generate unique ID if not provided
    const formId = formData.id || `ocr-form-${Date.now()}`;
    
    // Store in KV store with ocr-form: prefix
    const { createClient } = await import('jsr:@supabase/supabase-js@2.49.8');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { error } = await supabase
      .from('kv_store_66fdb7c0')
      .upsert({
        key: `ocr-form:${formId}`,
        value: formData
      });
    
    if (error) {
      console.error('Error saving OCR form:', error);
      return c.json({ error: 'Failed to save form' }, 500);
    }
    
    console.log(`✓ Saved OCR form: ${formId}`);
    return c.json({ success: true, formId });
    
  } catch (error) {
    console.error('Error in save-form endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get all saved OCR forms
ocrRoutes.get('/forms', async (c) => {
  try {
    const { createClient } = await import('jsr:@supabase/supabase-js@2.49.8');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data, error } = await supabase
      .from('kv_store_66fdb7c0')
      .select('key, value')
      .like('key', 'ocr-form:%');
    
    if (error) {
      console.error('Error fetching OCR forms:', error);
      return c.json({ error: 'Failed to fetch forms' }, 500);
    }
    
    const forms = (data || []).map(row => ({
      ...row.value,
      id: row.key.replace('ocr-form:', '')
    }));
    
    console.log(`✓ Retrieved ${forms.length} OCR forms`);
    return c.json({ forms });
    
  } catch (error) {
    console.error('Error in forms endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default ocrRoutes;

// Fallback fields for when OCR is not available
function getFallbackFields() {
  return [
    // Demographics Section
    {
      id: 'field-1',
      text: 'Patient Full Name',
      type: 'text',
      required: true,
      fhirMapping: 'Patient.name'
    },
    {
      id: 'field-2',
      text: 'Date of Birth',
      type: 'date',
      required: true,
      fhirMapping: 'Patient.birthDate'
    },
    {
      id: 'field-3',
      text: 'Gender',
      type: 'choice',
      required: true,
      fhirMapping: 'Patient.gender',
      options: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    
    // Medical History Section
    {
      id: 'field-4',
      text: 'Do you have a history of hypertension (high blood pressure)?',
      type: 'boolean',
      required: true,
      fhirMapping: 'Condition.code'
    },
    {
      id: 'field-5',
      text: 'Do you have diabetes mellitus?',
      type: 'boolean',
      required: true,
      fhirMapping: 'Condition.code'
    },
    {
      id: 'field-6',
      text: 'Do you have asthma or COPD?',
      type: 'boolean',
      required: true,
      fhirMapping: 'Condition.code'
    },
    {
      id: 'field-7',
      text: 'Have you had any previous surgeries?',
      type: 'text',
      required: false,
      fhirMapping: 'Procedure.code'
    },
    
    // Current Medications
    {
      id: 'field-8',
      text: 'List current medications (including dosage)',
      type: 'text',
      required: false,
      fhirMapping: 'MedicationStatement.medicationCodeableConcept'
    },
    {
      id: 'field-9',
      text: 'Are you taking any blood pressure medications?',
      type: 'choice',
      required: true,
      fhirMapping: 'MedicationStatement.medicationCodeableConcept',
      options: ['Yes - Lisinopril', 'Yes - Amlodipine', 'Yes - Metoprolol', 'Yes - Other', 'No']
    },
    
    // Allergies
    {
      id: 'field-10',
      text: 'Do you have any drug allergies?',
      type: 'text',
      required: false,
      fhirMapping: 'AllergyIntolerance.code'
    },
    {
      id: 'field-11',
      text: 'Allergy to Penicillin?',
      type: 'boolean',
      required: true,
      fhirMapping: 'AllergyIntolerance.code'
    },
    
    // Family History
    {
      id: 'field-12',
      text: 'Family history of heart disease?',
      type: 'boolean',
      required: false,
      fhirMapping: 'FamilyMemberHistory.condition'
    },
    {
      id: 'field-13',
      text: 'Family history of cancer?',
      type: 'choice',
      required: false,
      fhirMapping: 'FamilyMemberHistory.condition',
      options: ['No', 'Yes - Breast cancer', 'Yes - Colon cancer', 'Yes - Lung cancer', 'Yes - Other']
    },
    
    // Social History
    {
      id: 'field-14',
      text: 'Do you smoke tobacco?',
      type: 'choice',
      required: true,
      fhirMapping: 'Observation.valueString',
      options: ['Never', 'Former smoker', 'Current smoker - less than 1 pack/day', 'Current smoker - 1+ pack/day']
    },
    {
      id: 'field-15',
      text: 'Alcohol consumption',
      type: 'choice',
      required: true,
      fhirMapping: 'Observation.valueString',
      options: ['None', 'Occasional (1-2 drinks/week)', 'Moderate (3-7 drinks/week)', 'Heavy (8+ drinks/week)']
    },
    
    // Review of Systems
    {
      id: 'field-16',
      text: 'Are you experiencing chest pain or shortness of breath?',
      type: 'boolean',
      required: true,
      fhirMapping: 'Observation.valueString'
    },
    {
      id: 'field-17',
      text: 'Have you had unexplained weight loss or gain?',
      type: 'boolean',
      required: false,
      fhirMapping: 'Observation.valueString'
    },
    {
      id: 'field-18',
      text: 'Current pain level (0-10 scale)',
      type: 'integer',
      required: false,
      fhirMapping: 'Observation.valueQuantity'
    },
    
    // Vital Signs
    {
      id: 'field-19',
      text: 'Blood Pressure (systolic)',
      type: 'integer',
      required: false,
      fhirMapping: 'Observation.valueQuantity'
    },
    {
      id: 'field-20',
      text: 'Heart Rate (beats per minute)',
      type: 'integer',
      required: false,
      fhirMapping: 'Observation.valueQuantity'
    },
  ];
}