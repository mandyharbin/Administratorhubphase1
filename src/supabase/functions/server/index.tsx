import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { matchPatient, type PatientIdentifier, type PatientDemographics } from "./fhir-match.ts";
import { 
  fetchAllPatients, 
  createRelatedPerson, 
  createConsent, 
  createProvenance 
} from "./healthlake-client.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import { addFormsRoutes } from "./forms-routes.ts";
import ocrRoutes from "./ocr-routes.ts";
import fileProcessingRoutes from "./file-processing.ts";
import authRoutes from "./auth-routes.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Cookie", "X-Session-Token"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    credentials: true,
    maxAge: 600,
  }),
);

// Add authentication routes
app.route('/', authRoutes);

// Add forms & checklists routes
addFormsRoutes(app);

// Add OCR routes
app.route('/make-server-66fdb7c0/ocr', ocrRoutes);

// Add file processing routes
app.route('/', fileProcessingRoutes);

// Health check endpoint
app.get("/make-server-66fdb7c0/health", (c) => {
  return c.json({ status: "ok" });
});

// Helper function to get keys and values by prefix (kv.getByPrefix only returns values)
async function getKeysAndValuesByPrefix(prefix: string): Promise<Array<{ key: string; value: any }>> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  const { data, error } = await supabase.from("kv_store_66fdb7c0").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

// Helper function to search MedlinePlus for health information
async function searchMedlinePlus(query: string): Promise<string> {
  try {
    // MedlinePlus Connect API - free, no API key required
    const searchQuery = encodeURIComponent(query);
    const url = `https://connect.medlineplus.gov/service?mainSearchCriteria.v.cs=2.16.840.1.113883.6.103&mainSearchCriteria.v.c=${searchQuery}&knowledgeResponseType=application/json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log('MedlinePlus API returned non-200 status:', response.status);
      return '';
    }
    
    const data = await response.json();
    
    if (data.feed?.entry && data.feed.entry.length > 0) {
      // Get the first relevant entry
      const entry = data.feed.entry[0];
      const title = entry.title?._value || '';
      const summary = entry.summary?._value || '';
      const link = entry.link?.find((l: any) => l.rel === 'alternate')?.href || '';
      
      if (title || summary) {
        let medlineInfo = '\n\nRELEVANT HEALTH EDUCATION (from MedlinePlus):\n';
        if (title) medlineInfo += `Topic: ${title}\n`;
        if (summary) medlineInfo += `Summary: ${summary}\n`;
        if (link) medlineInfo += `More info: ${link}\n`;
        return medlineInfo;
      }
    }
    
    return '';
  } catch (error) {
    console.error('Error fetching MedlinePlus data:', error);
    return '';
  }
}

// ChatGPT endpoint for AI Assistant
app.post("/make-server-66fdb7c0/chat", async (c) => {
  try {
    const { messages, userMessage, patientContext, knowledgeBase } = await c.req.json();
    // Try multiple possible environment variable names
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_NEW') || 
                         Deno.env.get('OPENAI_API_KEY') ||
                         Deno.env.get('OPENAI_KEY');

    // Check if we have a valid OpenAI key (starts with sk-)
    const hasValidKey = openaiApiKey && openaiApiKey.startsWith('sk-');

    if (!hasValidKey) {
      console.log('Using demo mode - no valid OpenAI API key configured');
      // Demo mode: return intelligent mock responses
      return generateDemoResponse(c, userMessage, patientContext, knowledgeBase);
    }

    console.log('Using OpenAI API key starting with:', openaiApiKey.substring(0, 7));

    // Try to fetch relevant MedlinePlus health education content
    let medlinePlusInfo = '';
    try {
      medlinePlusInfo = await searchMedlinePlus(userMessage);
      if (medlinePlusInfo) {
        console.log('Found MedlinePlus content for query');
      }
    } catch (error) {
      console.log('MedlinePlus search skipped or failed:', error);
    }

    // Build patient-specific context
    let patientInfo = '';
    if (patientContext) {
      patientInfo = `\n\nCURRENT PATIENT: ${patientContext.firstName} ${patientContext.lastName}\n`;
      if (patientContext.medications && patientContext.medications.length > 0) {
        patientInfo += `\nACTIVE MEDICATIONS:\n`;
        patientContext.medications.forEach((med: any) => {
          const refillDate = new Date(med.nextRefillDate);
          const formattedDate = refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          patientInfo += `- ${med.name}: ${med.status}, may renew after ${formattedDate}\n`;
        });
      } else {
        patientInfo += `\nNo active medications on file.\n`;
      }
    }

    // Build knowledge base context
    let knowledgeInfo = '';
    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeInfo = `\n\nKNOWLEDGE BASE - Use this to answer patient questions:\n`;
      knowledgeBase.forEach((faq: any) => {
        knowledgeInfo += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
    }

    // System prompt defining the AI assistant's role and capabilities
    const systemPrompt = `You are an AI healthcare receptionist assistant for BASE Health. Your role is to help patients with their healthcare practice inquiries.${patientInfo}${knowledgeInfo}${medlinePlusInfo}

YOUR CAPABILITIES:
1. Acknowledge existence of appointments, labs, prescriptions with neutral status info
2. Provide operational help (directions, hours, billing contact info, parking info)
3. Share general pre-approved educational health content from MedlinePlus and knowledge base
4. Route requests you cannot handle to appropriate staff

CRITICAL LIMITATIONS:
- You CANNOT schedule, reschedule, or cancel appointments
- You CANNOT provide specific lab result values or interpret medical results
- You CANNOT diagnose or provide specific medical advice for symptoms
- You CANNOT process payments or provide specific billing amounts
- You CANNOT prescribe or change medications

ROUTING RULES - When you encounter these, respond with: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?"
- Appointment scheduling, rescheduling, or cancellation requests
- Specific medical symptoms requiring clinical assessment (pain, fever, illness)
- Specific lab result values or interpretation
- Payment or billing balance inquiries

HEALTH EDUCATION GUIDELINES:
- When MedlinePlus information is available, you may share it as general educational content
- Always clarify that this is educational information, not medical advice
- For specific medical concerns, still route to clinical staff

IMPORTANT INSTRUCTIONS FOR APPOINTMENT QUESTIONS:
- When asked about upcoming appointments, use the UPCOMING APPOINTMENTS data provided in the patient context above
- Format appointment dates in a natural way (e.g., "January 14, 2025 at 2:00 PM")
- Include the provider name and appointment type
- If no appointments are scheduled, let them know and offer to help them schedule one

IMPORTANT INSTRUCTIONS FOR MEDICATION QUESTIONS:
- When asked about prescriptions or medications, use the ACTIVE MEDICATIONS data provided in the patient context above
- Include both the medication name and next renewal date
- If no medications are on file, let them know and offer to connect them with the practice

PRACTICE INFORMATION:
- Practice location: 123 Health Plaza, Suite 200
- Hours: Monday-Friday 7:00 AM - 7:00 PM, Saturday 9:00 AM - 1:00 PM
- Billing office: (555) 123-4567, Monday-Friday 8:00 AM - 5:00 PM
- Parking: Free in north lot

Be conversational, helpful, and empathetic. Keep responses concise (2-3 sentences typically). Always use the actual patient data provided above rather than making up information.`;

    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.sender === 'patient' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      
      // Check if it's an invalid API key error - fall back to demo mode
      if (errorData.includes('invalid_api_key') || errorData.includes('Incorrect API key')) {
        console.log('⚠️ Using Demo Mode - OpenAI API key is invalid or expired');
        console.log('💡 To enable live AI responses: Update OPENAI_API_KEY_NEW in Supabase Dashboard > Project Settings > Edge Functions > Secrets');
        console.log('   Get a new key at: https://platform.openai.com/api-keys');
        return generateDemoResponse(c, userMessage, patientContext, knowledgeBase);
      }
      
      // Log error for other types of failures
      console.error('OpenAI API error:', errorData);
      return c.json({ error: 'Failed to get AI response', details: errorData }, response.status);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return c.json({ error: 'No response from AI' }, 500);
    }

    // Detect if message should be routed to staff
    const shouldRoute = aiResponse.includes("I am unable to assist with that") ||
                        aiResponse.includes("routed this to the practice");

    return c.json({ 
      response: aiResponse,
      shouldRoute,
      detectedIntent: shouldRoute ? detectIntent(userMessage) : null
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// Helper function to detect intent for routing
function detectIntent(message: string): string {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('schedule') || lowerMsg.includes('book') || 
      lowerMsg.includes('cancel') || lowerMsg.includes('reschedule')) {
    return 'appointment_scheduling';
  }
  if (lowerMsg.includes('pain') || lowerMsg.includes('symptom') || 
      lowerMsg.includes('sick') || lowerMsg.includes('hurt') || lowerMsg.includes('fever')) {
    return 'medical_symptom';
  }
  if (lowerMsg.includes('lab') && (lowerMsg.includes('result') || lowerMsg.includes('value'))) {
    return 'clinical_results';
  }
  if (lowerMsg.includes('pay') || lowerMsg.includes('owe') || lowerMsg.includes('balance')) {
    return 'billing_inquiry';
  }
  
  return 'general_routing';
}

// Function to generate demo responses
function generateDemoResponse(c: any, userMessage: string, patientContext?: any, knowledgeBase?: any[], locations?: any[]): any {
  const lowerMsg = userMessage.toLowerCase();
  
  // First, check if the question matches any FAQ in the knowledge base
  if (knowledgeBase && knowledgeBase.length > 0) {
    for (const faq of knowledgeBase) {
      const questionLower = faq.question.toLowerCase();
      const answerKeywords = faq.answer.toLowerCase();
      
      // Check if user message contains significant words from the FAQ question or if it's asking about the topic
      const questionWords = questionLower.split(' ').filter(w => w.length > 3);
      const matchCount = questionWords.filter(word => lowerMsg.includes(word)).length;
      
      // If we have a good match (multiple keywords match), return the FAQ answer
      if (matchCount >= 2 || 
          (lowerMsg.includes('office') && questionLower.includes('office')) ||
          (lowerMsg.includes('hours') && questionLower.includes('hours')) ||
          (lowerMsg.includes('location') && questionLower.includes('location')) ||
          (lowerMsg.includes('parking') && questionLower.includes('parking')) ||
          (lowerMsg.includes('insurance') && questionLower.includes('insurance')) ||
          (lowerMsg.includes('payment') && questionLower.includes('payment')) ||
          (lowerMsg.includes('contact') && questionLower.includes('contact')) ||
          (lowerMsg.includes('early') && questionLower.includes('early')) ||
          (lowerMsg.includes('bring') && questionLower.includes('bring')) ||
          (lowerMsg.includes('cancel') && questionLower.includes('cancel') && questionLower.includes('policy'))) {
        return c.json({
          response: faq.answer,
          shouldRoute: false,
          detectedIntent: null
        });
      }
    }
  }
  
  // Test Scenario 1: Schedule/Reschedule/Cancel appointment - Route to staff
  if (lowerMsg.includes('schedule') || lowerMsg.includes('book') || 
      lowerMsg.includes('cancel') || lowerMsg.includes('reschedule')) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?",
      shouldRoute: true,
      detectedIntent: 'appointment_scheduling',
      isDemoMode: true
    });
  }
  
  // Test Scenario 2: When is my next appointment - Direct answer (no routing)
  if ((lowerMsg.includes('next') || lowerMsg.includes('upcoming')) && lowerMsg.includes('appointment')) {
    if (patientContext && patientContext.appointments && patientContext.appointments.length > 0) {
      const nextAppt = patientContext.appointments[0];
      const date = new Date(nextAppt.date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      return c.json({ 
        response: `Your next appointment is ${formattedDate} at ${nextAppt.time} with ${nextAppt.provider} for ${nextAppt.type}.`,
        shouldRoute: false,
        detectedIntent: null
      });
    } else {
      return c.json({ 
        response: "I don't see any upcoming appointments on file. Would you like me to help you schedule one?",
        shouldRoute: false,
        detectedIntent: null
      });
    }
  }
  
  // Test Scenario 3: Prescription status - Direct answer (no routing)
  if (lowerMsg.includes('prescription') || lowerMsg.includes('refill') || lowerMsg.includes('rx')) {
    if (patientContext && patientContext.medications && patientContext.medications.length > 0) {
      // Use actual patient medication data
      const medResponses = patientContext.medications.map((med: any) => {
        const refillDate = new Date(med.nextRefillDate);
        const formattedDate = refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${med.name} is ${med.status.toLowerCase()} and you may renew after ${formattedDate}`;
      });
      
      const response = medResponses.length === 1 
        ? medResponses[0] + '.'
        : 'Here are your medications: ' + medResponses.join('; ') + '.';
      
      return c.json({ 
        response,
        shouldRoute: false,
        detectedIntent: null
      });
    } else {
      return c.json({ 
        response: "I don't see any active prescriptions on file. Would you like me to route this to the practice for assistance?",
        shouldRoute: false,
        detectedIntent: null
      });
    }
  }
  
  // Medical symptoms - Route to staff
  if (lowerMsg.includes('pain') || lowerMsg.includes('symptom') || 
      lowerMsg.includes('sick') || lowerMsg.includes('hurt') || lowerMsg.includes('fever')) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?",
      shouldRoute: true,
      detectedIntent: 'medical_symptom'
    });
  }
  
  // Lab results - Route to staff
  if (lowerMsg.includes('lab') && (lowerMsg.includes('result') || lowerMsg.includes('value'))) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?",
      shouldRoute: true,
      detectedIntent: 'clinical_results'
    });
  }
  
  // Billing inquiries - Route to staff
  if (lowerMsg.includes('pay') || lowerMsg.includes('owe') || lowerMsg.includes('balance')) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?",
      shouldRoute: true,
      detectedIntent: 'billing_inquiry'
    });
  }
  
  // Default: Route to staff for general inquiries
  return c.json({ 
    response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat. Would you like me to send now?",
    shouldRoute: true,
    detectedIntent: 'general_routing',
    isDemoMode: true
  });
}

// Function to generate demo responses with MedlinePlus
async function generateDemoResponseWithMedline(c: any, userMessage: string, patientContext?: any, knowledgeBase?: any[], locations?: any[], useMedlinePlus?: boolean): any {
  const lowerMsg = userMessage.toLowerCase();
  
  // Detect appointment inquiry intent
  const isAppointmentInquiry = 
    (lowerMsg.includes('next') || lowerMsg.includes('upcoming') || lowerMsg.includes('when')) && 
    lowerMsg.includes('appointment');
  
  // If it's an appointment inquiry, fetch from FHIR endpoint
  if (isAppointmentInquiry) {
    try {
      // Fetch appointments from FHIR endpoint
      const today = new Date().toISOString().split('T')[0];
      const fhirResponse = await fetch(
        `http://localhost:54321/functions/v1/make-server-66fdb7c0/fhir/Appointment?patient=patient-001&date=ge${today}&_sort=date`,
        {
          headers: {
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (fhirResponse.ok) {
        const fhirData = await fhirResponse.json();
        
        if (fhirData.entry && fhirData.entry.length > 0) {
          // Map FHIR appointments to friendly format
          const appointments = fhirData.entry.map((entry: any) => {
            const resource = entry.resource;
            const startDate = new Date(resource.start);
            
            const practitioner = resource.participant.find((p: any) => 
              p.actor.reference.startsWith('Practitioner/')
            );
            
            const location = resource.participant.find((p: any) => 
              p.actor.reference.startsWith('Location/')
            );
            
            return {
              date: startDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              time: startDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              }),
              provider: practitioner?.actor.display || 'Provider',
              location: location?.actor.display || 'Main Office',
              type: resource.appointmentType?.coding?.[0]?.display || 'Appointment'
            };
          });
          
          // Build response from FHIR data
          if (appointments.length === 1) {
            const appt = appointments[0];
            return c.json({ 
              response: `Your next appointment is on ${appt.date} at ${appt.time} with ${appt.provider} at ${appt.location}. This is a ${appt.type}.`,
              shouldRoute: false,
              detectedIntent: 'appointment_inquiry',
              metadata: {
                dataSource: 'FHIR',
                appointmentCount: 1
              }
            });
          } else if (appointments.length > 1) {
            const appt = appointments[0];
            return c.json({ 
              response: `Your next appointment is on ${appt.date} at ${appt.time} with ${appt.provider}. You have ${appointments.length} appointments scheduled in total.`,
              shouldRoute: false,
              detectedIntent: 'appointment_inquiry',
              metadata: {
                dataSource: 'FHIR',
                appointmentCount: appointments.length
              }
            });
          }
        }
      }
      
      // Fallback if FHIR call fails or returns no appointments
      console.log('FHIR call did not return appointments, using fallback');
    } catch (error) {
      console.log('FHIR fetch failed, using fallback:', error);
    }
    
    // Fallback: use mock data
    return c.json({ 
      response: "Your next appointment is November 20th at 3:30 PM with Dr. Smith.",
      shouldRoute: false,
      detectedIntent: 'appointment_inquiry'
    });
  }
  
  // First, check if the question matches any FAQ in the knowledge base
  if (knowledgeBase && knowledgeBase.length > 0) {
    for (const faq of knowledgeBase) {
      const questionLower = faq.question.toLowerCase();
      const answerKeywords = faq.answer.toLowerCase();
      
      // Check if user message contains significant words from the FAQ question or if it's asking about the topic
      const questionWords = questionLower.split(' ').filter(w => w.length > 3);
      const matchCount = questionWords.filter(word => lowerMsg.includes(word)).length;
      
      // If we have a good match (multiple keywords match), return the FAQ answer
      if (matchCount >= 2 || 
          (lowerMsg.includes('office') && questionLower.includes('office')) ||
          (lowerMsg.includes('hours') && questionLower.includes('hours')) ||
          (lowerMsg.includes('location') && questionLower.includes('location')) ||
          (lowerMsg.includes('parking') && questionLower.includes('parking')) ||
          (lowerMsg.includes('insurance') && questionLower.includes('insurance')) ||
          (lowerMsg.includes('payment') && questionLower.includes('payment')) ||
          (lowerMsg.includes('contact') && questionLower.includes('contact')) ||
          (lowerMsg.includes('early') && questionLower.includes('early')) ||
          (lowerMsg.includes('bring') && questionLower.includes('bring')) ||
          (lowerMsg.includes('cancel') && questionLower.includes('cancel') && questionLower.includes('policy'))) {
        return c.json({
          response: faq.answer,
          shouldRoute: false,
          detectedIntent: null
        });
      }
    }
  }
  
  // Test Scenario 1: Schedule/Reschedule/Cancel appointment - Route to staff
  if (lowerMsg.includes('schedule') || lowerMsg.includes('book') || 
      lowerMsg.includes('cancel') || lowerMsg.includes('reschedule')) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
      shouldRoute: true,
      detectedIntent: 'appointment_scheduling'
    });
  }
  
  // Test Scenario 3: Prescription status - Direct answer (no routing)
  if (lowerMsg.includes('prescription') || lowerMsg.includes('refill') || lowerMsg.includes('rx')) {
    if (patientContext && patientContext.medications && patientContext.medications.length > 0) {
      // Use actual patient medication data
      const medResponses = patientContext.medications.map((med: any) => {
        const refillDate = new Date(med.nextRefillDate);
        const formattedDate = refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${med.name} is ${med.status.toLowerCase()} and you may renew after ${formattedDate}`;
      });
      
      const response = medResponses.length === 1 
        ? medResponses[0] + '.'
        : 'Here are your medications: ' + medResponses.join('; ') + '.';
      
      return c.json({ 
        response,
        shouldRoute: false,
        detectedIntent: null
      });
    } else {
      return c.json({ 
        response: "I don't see any active prescriptions on file. Would you like me to route this to the practice for assistance?",
        shouldRoute: false,
        detectedIntent: null
      });
    }
  }
  
  // Health Education Questions - Check for MedlinePlus first
  const isHealthEducationQuery = 
    lowerMsg.includes('what is') || 
    lowerMsg.includes('what are') ||
    lowerMsg.includes('tell me about') ||
    lowerMsg.includes('information about') ||
    lowerMsg.includes('explain') ||
    lowerMsg.match(/\b(diabetes|asthma|hypertension|blood pressure|cholesterol|arthritis|cancer|flu|covid)\b/);
  
  if (isHealthEducationQuery && useMedlinePlus) {
    try {
      const medlinePlusInfo = await searchMedlinePlus(userMessage);
      if (medlinePlusInfo) {
        console.log('Returning MedlinePlus content to user');
        
        // Parse the MedlinePlus info to create a friendly response
        const lines = medlinePlusInfo.split('\n').filter(line => line.trim());
        let response = '';
        
        for (const line of lines) {
          if (line.startsWith('Topic:')) {
            const topic = line.replace('Topic:', '').trim();
            response += `Here's some information about ${topic}:\n\n`;
          } else if (line.startsWith('Summary:')) {
            const summary = line.replace('Summary:', '').trim();
            response += `${summary}\n\n`;
          } else if (line.startsWith('More info:')) {
            const link = line.replace('More info:', '').trim();
            response += `For more details, visit: ${link}\n\n`;
          }
        }
        
        if (response) {
          response += '\n(Source: MedlinePlus - U.S. National Library of Medicine)';
          return c.json({ 
            response: response.trim(),
            shouldRoute: false,
            detectedIntent: null,
            metadata: {
              usedMedlinePlus: true
            }
          });
        }
      }
    } catch (error) {
      console.log('MedlinePlus search failed:', error);
    }
  }
  
  // Medical symptoms requiring clinical assessment - Route to staff
  if (lowerMsg.includes('pain') || lowerMsg.includes('symptom') || 
      lowerMsg.includes('sick') || lowerMsg.includes('hurt') || lowerMsg.includes('fever')) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
      shouldRoute: true,
      detectedIntent: 'medical_symptom'
    });
  }
  
  // Lab results - Route to staff
  if (lowerMsg.includes('lab') && (lowerMsg.includes('result') || lowerMsg.includes('value'))) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
      shouldRoute: true,
      detectedIntent: 'clinical_results'
    });
  }
  
  // Billing inquiries - Route to staff
  if (lowerMsg.includes('pay') || lowerMsg.includes('owe') || lowerMsg.includes('balance')) {
    return c.json({ 
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
      shouldRoute: true,
      detectedIntent: 'billing_inquiry'
    });
  }
  
  // Default: Route to staff for general inquiries
  return c.json({ 
    response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
    shouldRoute: true,
    detectedIntent: 'general_routing',
    metadata: {
      usedMedlinePlus: false,
      knowledgeSourcesUsed: knowledgeBase ? knowledgeBase.length : 0
    }
  });
}

// Lexicons endpoints
app.get("/make-server-66fdb7c0/lexicons", async (c) => {
  try {
    const lexicons = await kv.getByPrefix('lexicon:');
    return c.json({ lexicons: lexicons.map(item => item.value) });
  } catch (error) {
    console.error('Error loading lexicons:', error);
    return c.json({ error: 'Failed to load lexicons', details: error.message }, 500);
  }
});

app.post("/make-server-66fdb7c0/lexicons", async (c) => {
  try {
    const lexicon = await c.req.json();
    const now = new Date().toISOString();
    
    // Mock user ID for prototype (in production, use: auth.uid())
    const userId = "00000000-0000-0000-0000-000000000001"; // Demo admin user
    
    // Add metadata if creating new
    if (!lexicon.created_at) {
      lexicon.created_by = userId;
      lexicon.created_at = now;
    }
    lexicon.updated_at = now;
    
    await kv.set(`lexicon:${lexicon.id}`, lexicon);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving lexicon:', error);
    return c.json({ error: 'Failed to save lexicon', details: error.message }, 500);
  }
});

app.delete("/make-server-66fdb7c0/lexicons/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`lexicon:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting lexicon:', error);
    return c.json({ error: 'Failed to delete lexicon', details: error.message }, 500);
  }
});

// Routing policies endpoints
app.get("/make-server-66fdb7c0/routing-policies", async (c) => {
  try {
    const policies = await kv.getByPrefix('policy:');
    return c.json({ policies: policies.map(item => item.value) });
  } catch (error) {
    console.error('Error loading policies:', error);
    return c.json({ error: 'Failed to load policies', details: error.message }, 500);
  }
});

app.post("/make-server-66fdb7c0/routing-policies", async (c) => {
  try {
    const policy = await c.req.json();
    const now = new Date().toISOString();
    
    // Mock user ID for prototype (in production, use: auth.uid())
    const userId = "00000000-0000-0000-0000-000000000001"; // Demo admin user
    
    // Add metadata if creating new
    if (!policy.created_at) {
      policy.created_by = userId;
      policy.created_at = now;
    }
    policy.updated_at = now;
    
    await kv.set(`policy:${policy.id}`, policy);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error saving policy:', error);
    return c.json({ error: 'Failed to save policy', details: error.message }, 500);
  }
});

app.delete("/make-server-66fdb7c0/routing-policies/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(`policy:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return c.json({ error: 'Failed to delete policy', details: error.message }, 500);
  }
});

// Export all configuration as JSON
app.get("/make-server-66fdb7c0/export-config", async (c) => {
  try {
    const lexicons = await kv.getByPrefix('lexicon:');
    const policies = await kv.getByPrefix('policy:');
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      lexicons: lexicons.map(item => item.value),
      routingPolicies: policies.map(item => item.value),
      metadata: {
        totalLexicons: lexicons.length,
        totalPolicies: policies.length,
        exportSource: "BASE Admin Hub"
      }
    };
    
    return c.json(exportData);
  } catch (error) {
    console.error('Error exporting config:', error);
    return c.json({ error: 'Failed to export config', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Appointments
app.get("/make-server-66fdb7c0/fhir/Appointment", async (c) => {
  try {
    const patientId = c.req.query('patient');
    const dateFilter = c.req.query('date'); // e.g., ge2025-11-20
    
    // Mock FHIR appointment data
    const appointments = [
      {
        resourceType: 'Appointment',
        id: 'appt-001',
        status: 'booked',
        start: '2025-11-20T15:30:00Z',
        end: '2025-11-20T16:00:00Z',
        appointmentType: {
          coding: [{
            code: 'FOLLOWUP',
            display: 'Follow-up'
          }]
        },
        description: 'Follow-up appointment',
        participant: [
          {
            actor: {
              reference: 'Practitioner/pract-001',
              display: 'Dr. Smith'
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Patient/patient-001',
              display: 'Patient'
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Location/loc-001',
              display: 'Main Office'
            },
            status: 'accepted'
          }
        ]
      },
      {
        resourceType: 'Appointment',
        id: 'appt-002',
        status: 'booked',
        start: '2025-12-05T10:00:00Z',
        end: '2025-12-05T10:30:00Z',
        appointmentType: {
          coding: [{
            code: 'CHECKUP',
            display: 'Annual Physical'
          }]
        },
        description: 'Annual physical examination',
        participant: [
          {
            actor: {
              reference: 'Practitioner/pract-002',
              display: 'Dr. Johnson'
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Patient/patient-001',
              display: 'Patient'
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Location/loc-002',
              display: 'Downtown Clinic'
            },
            status: 'accepted'
          }
        ]
      },
      {
        resourceType: 'Appointment',
        id: 'appt-003',
        status: 'booked',
        start: '2025-12-15T14:00:00Z',
        end: '2025-12-15T14:30:00Z',
        appointmentType: {
          coding: [{
            code: 'LABWORK',
            display: 'Lab Work'
          }]
        },
        description: 'Blood work',
        participant: [
          {
            actor: {
              reference: 'Practitioner/pract-001',
              display: 'Dr. Smith'
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Patient/patient-001',
              display: 'Patient'
            },
            status: 'accepted'
          },
          {
            actor: {
              reference: 'Location/loc-001',
              display: 'Main Office'
            },
            status: 'accepted'
          }
        ]
      }
    ];

    // Filter by date if provided (ge = greater than or equal)
    let filteredAppointments = appointments;
    if (dateFilter && dateFilter.startsWith('ge')) {
      const filterDate = new Date(dateFilter.substring(2));
      filteredAppointments = appointments.filter(appt => 
        new Date(appt.start) >= filterDate
      );
    }

    // Sort by date
    filteredAppointments.sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    // Return FHIR Bundle format
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: filteredAppointments.length,
      entry: filteredAppointments.map(appt => ({
        resource: appt
      }))
    };

    return c.json(bundle);
  } catch (error) {
    console.error('Error fetching FHIR appointments:', error);
    return c.json({ error: 'Failed to fetch appointments', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Billing Accounts
app.get("/make-server-66fdb7c0/fhir/Account", async (c) => {
  try {
    const subjectParam = c.req.query('subject'); // e.g., Patient/patient-001
    
    // Extract patient ID from subject parameter
    const patientId = subjectParam ? subjectParam.replace('Patient/', '') : null;
    
    // Mock FHIR Account data (billing accounts)
    const allAccounts = [
      // Accounts for patient-001 (Sarah Elena Martinez)
      {
        resourceType: 'Account',
        id: 'account-001-1',
        status: 'active',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'PBILLACCT',
              display: 'Patient Billing Account'
            }
          ],
          text: 'Patient Billing Account'
        },
        name: 'Annual Physical - 2025',
        subject: [
          {
            reference: 'Patient/patient-001',
            display: 'Sarah Elena Martinez'
          }
        ],
        servicePeriod: {
          start: '2025-01-15',
          end: '2025-12-31'
        },
        balance: {
          value: 245.50,
          currency: 'USD'
        },
        description: 'Annual physical examination and related lab work',
        guarantor: [
          {
            party: {
              reference: 'Patient/patient-001',
              display: 'Sarah Elena Martinez'
            },
            onHold: false
          }
        ],
        coverage: [
          {
            coverage: {
              reference: 'Coverage/cov-001',
              display: 'Blue Cross PPO'
            },
            priority: 1
          }
        ]
      },
      {
        resourceType: 'Account',
        id: 'account-001-2',
        status: 'on-hold',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'PBILLACCT',
              display: 'Patient Billing Account'
            }
          ],
          text: 'Copay Account'
        },
        name: 'Previous Visit Copay',
        subject: [
          {
            reference: 'Patient/patient-001',
            display: 'Sarah Elena Martinez'
          }
        ],
        servicePeriod: {
          start: '2024-11-01',
          end: '2024-11-30'
        },
        balance: {
          value: 0.00,
          currency: 'USD'
        },
        description: 'Copay for office visit - PAID',
        guarantor: [
          {
            party: {
              reference: 'Patient/patient-001',
              display: 'Sarah Elena Martinez'
            },
            onHold: true
          }
        ]
      },
      // Accounts for patient-002 (Michael David Johnson)
      {
        resourceType: 'Account',
        id: 'account-002-1',
        status: 'active',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'PBILLACCT',
              display: 'Patient Billing Account'
            }
          ],
          text: 'Patient Billing Account'
        },
        name: 'Specialty Consultation',
        subject: [
          {
            reference: 'Patient/patient-002',
            display: 'Michael David Johnson'
          }
        ],
        servicePeriod: {
          start: '2025-10-01',
          end: '2025-10-31'
        },
        balance: {
          value: 1250.00,
          currency: 'USD'
        },
        description: 'Cardiology consultation and stress test',
        guarantor: [
          {
            party: {
              reference: 'Patient/patient-002',
              display: 'Michael David Johnson'
            },
            onHold: false
          }
        ],
        coverage: [
          {
            coverage: {
              reference: 'Coverage/cov-002',
              display: 'Aetna HMO'
            },
            priority: 1
          }
        ]
      },
      {
        resourceType: 'Account',
        id: 'account-002-2',
        status: 'active',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'PBILLACCT',
              display: 'Patient Billing Account'
            }
          ],
          text: 'Prescription Account'
        },
        name: 'Prescription Refill',
        subject: [
          {
            reference: 'Patient/patient-002',
            display: 'Michael David Johnson'
          }
        ],
        servicePeriod: {
          start: '2025-11-01'
        },
        balance: {
          value: 35.00,
          currency: 'USD'
        },
        description: 'Monthly prescription copay',
        guarantor: [
          {
            party: {
              reference: 'Patient/patient-002',
              display: 'Michael David Johnson'
            },
            onHold: false
          }
        ]
      }
    ];

    // Filter by patient if subject parameter is provided
    let filteredAccounts = allAccounts;
    if (patientId) {
      filteredAccounts = allAccounts.filter(account => 
        account.subject.some(subj => subj.reference === `Patient/${patientId}`)
      );
    }

    // Sort by service period (most recent first)
    filteredAccounts.sort((a, b) => {
      const dateA = new Date(a.servicePeriod.start).getTime();
      const dateB = new Date(b.servicePeriod.start).getTime();
      return dateB - dateA; // Descending order
    });

    // Return FHIR Bundle format
    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: filteredAccounts.length,
      entry: filteredAccounts.map(account => ({
        resource: account
      }))
    };

    return c.json(bundle);
  } catch (error) {
    console.error('Error fetching FHIR accounts:', error);
    return c.json({ error: 'Failed to fetch accounts', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient Conditions
app.get("/make-server-66fdb7c0/fhir/Condition", async (c) => {
  try {
    const patientParam = c.req.query('patient');
    
    const allConditions = [
      {
        resourceType: 'Condition',
        id: 'condition-001-1',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'problem-list-item', display: 'Problem List Item' }] }],
        severity: { coding: [{ system: 'http://snomed.info/sct', code: 'mild', display: 'Mild' }] },
        code: { coding: [{ system: 'http://snomed.info/sct', code: '38341003', display: 'Hypertension' }], text: 'Essential Hypertension' },
        subject: { reference: 'Patient/patient-001', display: 'Sarah Elena Martinez' },
        onsetDateTime: '2022-03-15',
        recordedDate: '2022-03-15',
        note: [{ text: 'Controlled with lifestyle modifications and medication' }]
      },
      {
        resourceType: 'Condition',
        id: 'condition-001-2',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'resolved', display: 'Resolved' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis', display: 'Encounter Diagnosis' }] }],
        code: { coding: [{ system: 'http://snomed.info/sct', code: '82272006', display: 'Common cold' }], text: 'Upper Respiratory Infection' },
        subject: { reference: 'Patient/patient-001', display: 'Sarah Elena Martinez' },
        onsetDateTime: '2024-10-01',
        abatementDateTime: '2024-10-10',
        recordedDate: '2024-10-01'
      },
      {
        resourceType: 'Condition',
        id: 'condition-002-1',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'problem-list-item', display: 'Problem List Item' }] }],
        severity: { coding: [{ system: 'http://snomed.info/sct', code: 'moderate', display: 'Moderate' }] },
        code: { coding: [{ system: 'http://snomed.info/sct', code: '73211009', display: 'Diabetes mellitus' }], text: 'Type 2 Diabetes Mellitus' },
        subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' },
        onsetDateTime: '2019-06-20',
        recordedDate: '2019-06-20',
        note: [{ text: 'Well controlled with metformin and diet. HbA1c 6.8%' }]
      },
      {
        resourceType: 'Condition',
        id: 'condition-002-2',
        clinicalStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active', display: 'Active' }] },
        verificationStatus: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed', display: 'Confirmed' }] },
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'problem-list-item', display: 'Problem List Item' }] }],
        severity: { coding: [{ system: 'http://snomed.info/sct', code: 'severe', display: 'Severe' }] },
        code: { coding: [{ system: 'http://snomed.info/sct', code: '49601007', display: 'Disorder of cardiovascular system' }], text: 'Coronary Artery Disease' },
        subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' },
        onsetDateTime: '2023-08-10',
        recordedDate: '2023-08-10',
        note: [{ text: 'Recent stress test abnormal. Scheduled for cardiac catheterization.' }]
      }
    ];

    let filteredConditions = allConditions;
    if (patientParam) {
      filteredConditions = allConditions.filter(condition => condition.subject.reference === `Patient/${patientParam}`);
    }

    filteredConditions.sort((a, b) => new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime());

    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: filteredConditions.length,
      entry: filteredConditions.map(condition => ({ resource: condition }))
    };

    return c.json(bundle);
  } catch (error) {
    console.error('Error fetching FHIR conditions:', error);
    return c.json({ error: 'Failed to fetch conditions', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient Encounters
app.get("/make-server-66fdb7c0/fhir/Encounter", async (c) => {
  try {
    const patientParam = c.req.query('patient');
    
    const allEncounters = [
      {
        resourceType: 'Encounter',
        id: 'encounter-001-1',
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
        type: [{ coding: [{ system: 'http://snomed.info/sct', code: '185349003', display: 'Encounter for check up' }], text: 'Annual Physical Examination' }],
        subject: { reference: 'Patient/patient-001', display: 'Sarah Elena Martinez' },
        participant: [{ individual: { reference: 'Practitioner/prac-001', display: 'Dr. Emily Chen, MD' } }],
        period: { start: '2025-01-15T09:00:00Z', end: '2025-01-15T10:30:00Z' },
        reasonCode: [{ coding: [{ system: 'http://snomed.info/sct', code: '410620009', display: 'Well child visit' }], text: 'Annual wellness visit' }],
        location: [{ location: { reference: 'Location/loc-001', display: 'Main Street Family Practice' } }]
      },
      {
        resourceType: 'Encounter',
        id: 'encounter-001-2',
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
        type: [{ coding: [{ system: 'http://snomed.info/sct', code: '270427003', display: 'Patient-initiated encounter' }], text: 'Sick Visit' }],
        subject: { reference: 'Patient/patient-001', display: 'Sarah Elena Martinez' },
        participant: [{ individual: { reference: 'Practitioner/prac-002', display: 'Dr. James Wilson, MD' } }],
        period: { start: '2024-10-01T14:30:00Z', end: '2024-10-01T15:00:00Z' },
        reasonCode: [{ coding: [{ system: 'http://snomed.info/sct', code: '82272006', display: 'Common cold' }], text: 'Upper respiratory symptoms' }],
        location: [{ location: { reference: 'Location/loc-001', display: 'Main Street Family Practice' } }]
      },
      {
        resourceType: 'Encounter',
        id: 'encounter-002-1',
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
        type: [{ coding: [{ system: 'http://snomed.info/sct', code: '281036007', display: 'Follow-up consultation' }], text: 'Cardiology Consultation' }],
        subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' },
        participant: [{ individual: { reference: 'Practitioner/prac-003', display: 'Dr. Sarah Thompson, MD (Cardiology)' } }],
        period: { start: '2025-10-01T10:00:00Z', end: '2025-10-01T11:30:00Z' },
        reasonCode: [{ coding: [{ system: 'http://snomed.info/sct', code: '49601007', display: 'Disorder of cardiovascular system' }], text: 'Cardiac stress test and consultation' }],
        location: [{ location: { reference: 'Location/loc-002', display: 'Heart & Vascular Center' } }]
      },
      {
        resourceType: 'Encounter',
        id: 'encounter-002-2',
        status: 'finished',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
        type: [{ coding: [{ system: 'http://snomed.info/sct', code: '439740005', display: 'Postoperative follow-up visit' }], text: 'Diabetes Follow-up' }],
        subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' },
        participant: [{ individual: { reference: 'Practitioner/prac-004', display: 'Dr. Michael Lee, MD (Endocrinology)' } }],
        period: { start: '2025-09-15T13:00:00Z', end: '2025-09-15T13:45:00Z' },
        reasonCode: [{ coding: [{ system: 'http://snomed.info/sct', code: '73211009', display: 'Diabetes mellitus' }], text: 'Routine diabetes management and lab review' }],
        location: [{ location: { reference: 'Location/loc-003', display: 'Endocrinology Associates' } }]
      },
      {
        resourceType: 'Encounter',
        id: 'encounter-002-3',
        status: 'planned',
        class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'Ambulatory' },
        type: [{ coding: [{ system: 'http://snomed.info/sct', code: '448337001', display: 'Telemedicine consultation' }], text: 'Virtual Follow-up' }],
        subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' },
        participant: [{ individual: { reference: 'Practitioner/prac-003', display: 'Dr. Sarah Thompson, MD (Cardiology)' } }],
        period: { start: '2025-12-05T15:00:00Z' },
        reasonCode: [{ text: 'Post-catheterization follow-up' }],
        location: [{ location: { reference: 'Location/virtual', display: 'Telehealth' } }]
      }
    ];

    let filteredEncounters = allEncounters;
    if (patientParam) {
      filteredEncounters = allEncounters.filter(encounter => encounter.subject.reference === `Patient/${patientParam}`);
    }

    filteredEncounters.sort((a, b) => new Date(b.period.start).getTime() - new Date(a.period.start).getTime());

    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: filteredEncounters.length,
      entry: filteredEncounters.map(encounter => ({ resource: encounter }))
    };

    return c.json(bundle);
  } catch (error) {
    console.error('Error fetching FHIR encounters:', error);
    return c.json({ error: 'Failed to fetch encounters', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient Procedures
app.get("/make-server-66fdb7c0/fhir/Procedure", async (c) => {
  try {
    const patientParam = c.req.query('patient');
    const allProcedures = [
      { resourceType: 'Procedure', id: 'procedure-001-1', status: 'completed', code: { coding: [{ system: 'http://snomed.info/sct', code: '73761001', display: 'Colonoscopy' }], text: 'Screening Colonoscopy' }, subject: { reference: 'Patient/patient-001', display: 'Sarah Elena Martinez' }, performedDateTime: '2023-05-12', performer: [{ actor: { reference: 'Practitioner/prac-005', display: 'Dr. Robert Garcia, MD' } }], note: [{ text: 'No polyps found.' }] },
      { resourceType: 'Procedure', id: 'procedure-002-1', status: 'completed', code: { coding: [{ system: 'http://snomed.info/sct', code: '40701008', display: 'Echocardiography' }], text: 'Cardiac Echocardiogram' }, subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' }, performedDateTime: '2025-10-01', performer: [{ actor: { reference: 'Practitioner/prac-003', display: 'Dr. Sarah Thompson, MD' } }], note: [{ text: 'Ejection fraction 55%.' }] },
      { resourceType: 'Procedure', id: 'procedure-002-2', status: 'completed', code: { coding: [{ system: 'http://snomed.info/sct', code: '252160004', display: 'Exercise stress test' }], text: 'Cardiac Stress Test' }, subject: { reference: 'Patient/patient-002', display: 'Michael David Johnson' }, performedDateTime: '2025-10-01', performer: [{ actor: { reference: 'Practitioner/prac-003', display: 'Dr. Sarah Thompson, MD' } }], note: [{ text: 'Positive for ischemia.' }] }
    ];
    let filteredProcedures = patientParam ? allProcedures.filter(p => p.subject.reference === `Patient/${patientParam}`) : allProcedures;
    filteredProcedures.sort((a, b) => new Date(b.performedDateTime).getTime() - new Date(a.performedDateTime).getTime());
    return c.json({ resourceType: 'Bundle', type: 'searchset', total: filteredProcedures.length, entry: filteredProcedures.map(p => ({ resource: p })) });
  } catch (error) {
    console.error('Error fetching FHIR procedures:', error);
    return c.json({ error: 'Failed to fetch procedures', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient Allergies
app.get("/make-server-66fdb7c0/fhir/AllergyIntolerance", async (c) => {
  try {
    const patientParam = c.req.query('patient');
    const allAllergies = [
      { resourceType: 'AllergyIntolerance', id: 'allergy-001-1', clinicalStatus: { coding: [{ code: 'active' }] }, type: 'allergy', category: ['medication'], criticality: 'high', code: { coding: [{ code: '7982', display: 'Penicillin' }], text: 'Penicillin' }, patient: { reference: 'Patient/patient-001' }, reaction: [{ manifestation: [{ text: 'Severe rash and hives' }], severity: 'severe' }], note: [{ text: 'Avoid all penicillin-based antibiotics' }] },
      { resourceType: 'AllergyIntolerance', id: 'allergy-002-1', clinicalStatus: { coding: [{ code: 'active' }] }, type: 'allergy', category: ['food'], criticality: 'high', code: { coding: [{ code: '227037002', display: 'Fish' }], text: 'Shellfish' }, patient: { reference: 'Patient/patient-002' }, reaction: [{ manifestation: [{ text: 'Anaphylactic reaction' }], severity: 'severe' }], note: [{ text: 'Carries EpiPen.' }] },
      { resourceType: 'AllergyIntolerance', id: 'allergy-002-2', clinicalStatus: { coding: [{ code: 'active' }] }, type: 'allergy', category: ['medication'], criticality: 'low', code: { coding: [{ code: '1191', display: 'Aspirin' }], text: 'Aspirin' }, patient: { reference: 'Patient/patient-002' }, reaction: [{ manifestation: [{ text: 'Mild stomach upset' }], severity: 'mild' }], note: [{ text: 'Can tolerate other NSAIDs' }] }
    ];
    let filteredAllergies = patientParam ? allAllergies.filter(a => a.patient.reference === `Patient/${patientParam}`) : allAllergies;
    return c.json({ resourceType: 'Bundle', type: 'searchset', total: filteredAllergies.length, entry: filteredAllergies.map(a => ({ resource: a })) });
  } catch (error) {
    console.error('Error fetching FHIR allergies:', error);
    return c.json({ error: 'Failed to fetch allergies', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient Observations
app.get("/make-server-66fdb7c0/fhir/Observation", async (c) => {
  try {
    const patientParam = c.req.query('patient');
    const allObservations = [
      { resourceType: 'Observation', id: 'obs-001-1', status: 'final', category: [{ coding: [{ code: 'vital-signs', display: 'Vital Signs' }] }], code: { coding: [{ code: '8867-4' }], text: 'Heart Rate' }, subject: { reference: 'Patient/patient-001' }, effectiveDateTime: '2025-01-15T09:00:00Z', valueQuantity: { value: 72, unit: 'beats/minute' } },
      { resourceType: 'Observation', id: 'obs-001-2', status: 'final', category: [{ coding: [{ code: 'vital-signs', display: 'Vital Signs' }] }], code: { text: 'Blood Pressure' }, subject: { reference: 'Patient/patient-001' }, effectiveDateTime: '2025-01-15T09:00:00Z', valueQuantity: { value: 128, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'obs-001-3', status: 'final', category: [{ coding: [{ code: 'laboratory', display: 'Laboratory' }] }], code: { text: 'Total Cholesterol' }, subject: { reference: 'Patient/patient-001' }, effectiveDateTime: '2025-01-15', valueQuantity: { value: 195, unit: 'mg/dL' } },
      { resourceType: 'Observation', id: 'obs-001-4', status: 'final', category: [{ coding: [{ code: 'laboratory', display: 'Laboratory' }] }], code: { text: 'HbA1c' }, subject: { reference: 'Patient/patient-001' }, effectiveDateTime: '2025-01-15', valueQuantity: { value: 5.6, unit: '%' } },
      { resourceType: 'Observation', id: 'obs-002-1', status: 'final', category: [{ coding: [{ code: 'vital-signs', display: 'Vital Signs' }] }], code: { text: 'Heart Rate' }, subject: { reference: 'Patient/patient-002' }, effectiveDateTime: '2025-10-01T10:00:00Z', valueQuantity: { value: 88, unit: 'beats/minute' } },
      { resourceType: 'Observation', id: 'obs-002-2', status: 'final', category: [{ coding: [{ code: 'vital-signs', display: 'Vital Signs' }] }], code: { text: 'Blood Pressure' }, subject: { reference: 'Patient/patient-002' }, effectiveDateTime: '2025-10-01T10:00:00Z', valueQuantity: { value: 142, unit: 'mmHg' } },
      { resourceType: 'Observation', id: 'obs-002-3', status: 'final', category: [{ coding: [{ code: 'laboratory', display: 'Laboratory' }] }], code: { text: 'HbA1c' }, subject: { reference: 'Patient/patient-002' }, effectiveDateTime: '2025-09-15', valueQuantity: { value: 6.8, unit: '%' } },
      { resourceType: 'Observation', id: 'obs-002-4', status: 'final', category: [{ coding: [{ code: 'laboratory', display: 'Laboratory' }] }], code: { text: 'Total Cholesterol' }, subject: { reference: 'Patient/patient-002' }, effectiveDateTime: '2025-09-15', valueQuantity: { value: 245, unit: 'mg/dL' } },
      { resourceType: 'Observation', id: 'obs-002-5', status: 'final', category: [{ coding: [{ code: 'laboratory', display: 'Laboratory' }] }], code: { text: 'Triglycerides' }, subject: { reference: 'Patient/patient-002' }, effectiveDateTime: '2025-09-15', valueQuantity: { value: 210, unit: 'mg/dL' } },
      { resourceType: 'Observation', id: 'obs-002-6', status: 'final', category: [{ coding: [{ code: 'laboratory', display: 'Laboratory' }] }], code: { text: 'WBC' }, subject: { reference: 'Patient/patient-002' }, effectiveDateTime: '2025-09-15', valueQuantity: { value: 7.2, unit: '10*3/uL' } }
    ];
    let filteredObservations = patientParam ? allObservations.filter(o => o.subject.reference === `Patient/${patientParam}`) : allObservations;
    filteredObservations.sort((a, b) => new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime());
    return c.json({ resourceType: 'Bundle', type: 'searchset', total: filteredObservations.length, entry: filteredObservations.map(o => ({ resource: o })) });
  } catch (error) {
    console.error('Error fetching FHIR observations:', error);
    return c.json({ error: 'Failed to fetch observations', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient Medications
app.get("/make-server-66fdb7c0/fhir/MedicationStatement", async (c) => {
  try {
    const patientParam = c.req.query('patient');
    const statusParam = c.req.query('status');
    const allMedications = [
      { 
        resourceType: 'MedicationStatement', 
        id: 'med-001-1', 
        status: 'active', 
        medicationCodeableConcept: { 
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '197361', display: 'Lisinopril 10mg' }], 
          text: 'Lisinopril 10mg' 
        }, 
        subject: { reference: 'Patient/patient-001' }, 
        effectiveDateTime: '2024-06-01',
        dosage: [{ text: 'Take 1 tablet once daily', route: { text: 'Oral' }, timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } } }],
        note: [{ text: 'For blood pressure management' }]
      },
      { 
        resourceType: 'MedicationStatement', 
        id: 'med-001-2', 
        status: 'active', 
        medicationCodeableConcept: { 
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '860975', display: 'Metformin 500mg' }], 
          text: 'Metformin 500mg' 
        }, 
        subject: { reference: 'Patient/patient-001' }, 
        effectiveDateTime: '2024-03-15',
        dosage: [{ text: 'Take 1 tablet twice daily with meals', route: { text: 'Oral' }, timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } } }],
        note: [{ text: 'For diabetes management' }]
      },
      { 
        resourceType: 'MedicationStatement', 
        id: 'med-001-3', 
        status: 'active', 
        medicationCodeableConcept: { 
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '617318', display: 'Atorvastatin 20mg' }], 
          text: 'Atorvastatin 20mg' 
        }, 
        subject: { reference: 'Patient/patient-001' }, 
        effectiveDateTime: '2024-08-20',
        dosage: [{ text: 'Take 1 tablet once daily at bedtime', route: { text: 'Oral' }, timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } } }],
        note: [{ text: 'For cholesterol management' }]
      },
      { 
        resourceType: 'MedicationStatement', 
        id: 'med-002-1', 
        status: 'active', 
        medicationCodeableConcept: { 
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '197361', display: 'Lisinopril 20mg' }], 
          text: 'Lisinopril 20mg' 
        }, 
        subject: { reference: 'Patient/patient-002' }, 
        effectiveDateTime: '2024-01-10',
        dosage: [{ text: 'Take 1 tablet once daily', route: { text: 'Oral' }, timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } } }]
      },
      { 
        resourceType: 'MedicationStatement', 
        id: 'med-002-2', 
        status: 'active', 
        medicationCodeableConcept: { 
          coding: [{ system: 'http://www.nlm.nih.gov/research/umls/rxnorm', code: '860975', display: 'Metformin 1000mg' }], 
          text: 'Metformin 1000mg' 
        }, 
        subject: { reference: 'Patient/patient-002' }, 
        effectiveDateTime: '2023-11-05',
        dosage: [{ text: 'Take 1 tablet twice daily with meals', route: { text: 'Oral' }, timing: { repeat: { frequency: 2, period: 1, periodUnit: 'd' } } }]
      }
    ];
    let filteredMedications = patientParam ? allMedications.filter(m => m.subject.reference === `Patient/${patientParam}`) : allMedications;
    if (statusParam) {
      filteredMedications = filteredMedications.filter(m => m.status === statusParam);
    }
    return c.json({ resourceType: 'Bundle', type: 'searchset', total: filteredMedications.length, entry: filteredMedications.map(m => ({ resource: m })) });
  } catch (error) {
    console.error('Error fetching FHIR medications:', error);
    return c.json({ error: 'Failed to fetch medications', details: error.message }, 500);
  }
});

// FHIR Mock Endpoint - Get Patient by ID
app.get("/make-server-66fdb7c0/fhir/Patient/:id", async (c) => {
  try {
    const patientId = c.req.param('id');
    
    // Mock FHIR patient data
    const mockPatients: { [key: string]: any } = {
      'patient-001': {
        resourceType: 'Patient',
        id: 'patient-001',
        active: true,
        name: [
          {
            use: 'official',
            family: 'Johnson',
            given: ['Sarah'],
            prefix: ['Ms.']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '(555) 234-5678',
            use: 'mobile'
          },
          {
            system: 'email',
            value: 'sarah.johnson@email.com',
            use: 'home'
          }
        ],
        gender: 'female',
        birthDate: '1990-03-15',
        address: [
          {
            use: 'home',
            line: ['742 Evergreen Terrace'],
            city: 'Springfield',
            state: 'IL',
            postalCode: '62701',
            country: 'USA'
          }
        ],
        maritalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
              code: 'M',
              display: 'Married'
            }
          ]
        },
        contact: [
          {
            relationship: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'C',
                    display: 'Emergency Contact'
                  }
                ]
              }
            ],
            name: {
              family: 'Martinez',
              given: ['Carlos']
            },
            telecom: [
              {
                system: 'phone',
                value: '(555) 234-5679'
              }
            ]
          }
        ]
      },
      'patient-002': {
        resourceType: 'Patient',
        id: 'patient-002',
        active: true,
        name: [
          {
            use: 'official',
            family: 'Johnson',
            given: ['Michael', 'David'],
            prefix: ['Mr.']
          }
        ],
        telecom: [
          {
            system: 'phone',
            value: '(555) 345-6789',
            use: 'mobile'
          },
          {
            system: 'email',
            value: 'michael.johnson@email.com',
            use: 'work'
          }
        ],
        gender: 'male',
        birthDate: '1972-07-22',
        address: [
          {
            use: 'home',
            line: ['123 Oak Street', 'Apt 4B'],
            city: 'Springfield',
            state: 'IL',
            postalCode: '62702',
            country: 'USA'
          }
        ],
        maritalStatus: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
              code: 'S',
              display: 'Single'
            }
          ]
        },
        contact: [
          {
            relationship: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
                    code: 'C',
                    display: 'Emergency Contact'
                  }
                ]
              }
            ],
            name: {
              family: 'Johnson',
              given: ['Patricia']
            },
            telecom: [
              {
                system: 'phone',
                value: '(555) 345-6780'
              }
            ]
          }
        ]
      }
    };

    const patient = mockPatients[patientId];
    
    if (!patient) {
      return c.json({ error: 'Patient not found' }, 404);
    }

    return c.json(patient);
  } catch (error) {
    console.error('Error fetching FHIR patient:', error);
    return c.json({ error: 'Failed to fetch patient', details: error.message }, 500);
  }
});

// Tenant Knowledge Sources endpoints
app.get("/make-server-66fdb7c0/tenants", async (c) => {
  try {
    const tenants = await kv.getByPrefix('tenant:');
    return c.json({ tenants: tenants.map(item => item.value) });
  } catch (error) {
    console.error('Error loading tenants:', error);
    return c.json({ error: 'Failed to load tenants', details: error.message }, 500);
  }
});

app.get("/make-server-66fdb7c0/tenants/:tenantId/knowledge-sources", async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const sources = await kv.getByPrefix(`knowledge:${tenantId}:`);
    return c.json({ knowledgeSources: sources.map(item => item.value) });
  } catch (error) {
    console.error('Error loading knowledge sources:', error);
    return c.json({ error: 'Failed to load knowledge sources', details: error.message }, 500);
  }
});

app.post("/make-server-66fdb7c0/tenants/:tenantId/knowledge-sources", async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const source = await c.req.json();
    const now = new Date().toISOString();
    
    // Mock user ID for prototype
    const userId = "00000000-0000-0000-0000-000000000001";
    
    // Add metadata if creating new
    if (!source.createdAt) {
      source.createdBy = userId;
      source.createdAt = now;
      source.version = '1.0';
      source.versionHistory = [{
        version: '1.0',
        updatedAt: now,
        updatedBy: userId,
        changes: 'Initial version'
      }];
    } else {
      // Increment version
      const versionParts = source.version.split('.');
      source.version = `${versionParts[0]}.${parseInt(versionParts[1]) + 1}`;
      
      // Add to version history
      source.versionHistory = [
        {
          version: source.version,
          updatedAt: now,
          updatedBy: userId,
          changes: 'Updated content'
        },
        ...(source.versionHistory || [])
      ];
    }
    
    source.updatedAt = now;
    source.tenantId = tenantId;
    
    await kv.set(`knowledge:${tenantId}:${source.id}`, source);
    return c.json({ success: true, source });
  } catch (error) {
    console.error('Error saving knowledge source:', error);
    return c.json({ error: 'Failed to save knowledge source', details: error.message }, 500);
  }
});

app.delete("/make-server-66fdb7c0/tenants/:tenantId/knowledge-sources/:id", async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const id = c.req.param('id');
    await kv.del(`knowledge:${tenantId}:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    return c.json({ error: 'Failed to delete knowledge source', details: error.message }, 500);
  }
});

// Tenant configuration endpoints
app.get("/make-server-66fdb7c0/tenants/:tenantId/config", async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const config = await kv.get(`tenant:config:${tenantId}`);
    
    // Return default config if not found
    if (!config) {
      return c.json({
        config: {
          tenantId,
          useMedlinePlus: true,
          autoRouting: true,
          languages: ['en'],
          createdAt: new Date().toISOString()
        }
      });
    }
    
    return c.json({ config });
  } catch (error) {
    console.error('Error loading tenant config:', error);
    return c.json({ error: 'Failed to load tenant config', details: error.message }, 500);
  }
});

app.post("/make-server-66fdb7c0/tenants/:tenantId/config", async (c) => {
  try {
    const tenantId = c.req.param('tenantId');
    const config = await c.req.json();
    const now = new Date().toISOString();
    
    config.tenantId = tenantId;
    config.updatedAt = now;
    
    if (!config.createdAt) {
      config.createdAt = now;
    }
    
    await kv.set(`tenant:config:${tenantId}`, config);
    return c.json({ success: true, config });
  } catch (error) {
    console.error('Error saving tenant config:', error);
    return c.json({ error: 'Failed to save tenant config', details: error.message }, 500);
  }
});

// Enhanced chat endpoint with tenant-specific knowledge
app.post("/make-server-66fdb7c0/chat-tenant", async (c) => {
  try {
    const { messages, userMessage, patientContext, tenantId, knowledgeBase, useMedlinePlus, locations } = await c.req.json();
    
    if (!tenantId) {
      return c.json({ error: 'Tenant ID is required' }, 400);
    }
    
    // Load tenant configuration (with fallback to passed params)
    const tenantConfig = await kv.get(`tenant:config:${tenantId}`) || { useMedlinePlus: useMedlinePlus || true };
    
    // Use passed knowledge base or load from KV store
    let knowledgeBaseData = knowledgeBase;
    if (!knowledgeBaseData || knowledgeBaseData.length === 0) {
      const knowledgeSourcesData = await kv.getByPrefix(`knowledge:${tenantId}:`);
      knowledgeBaseData = knowledgeSourcesData.map(item => ({
        question: item.value.question,
        answer: item.value.answer,
        category: item.value.category,
        version: item.value.version
      }));
    }
    
    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY_NEW') || 
                         Deno.env.get('OPENAI_API_KEY') ||
                         Deno.env.get('OPENAI_KEY');
    
    const hasValidKey = openaiApiKey && openaiApiKey.startsWith('sk-');
    
    if (!hasValidKey) {
      console.log('Using demo mode - no valid OpenAI API key configured');
      return await generateDemoResponseWithMedline(c, userMessage, patientContext, knowledgeBaseData, locations, tenantConfig.useMedlinePlus);
    }
    
    // Fetch MedlinePlus if enabled for tenant
    let medlinePlusInfo = '';
    if (tenantConfig.useMedlinePlus) {
      try {
        medlinePlusInfo = await searchMedlinePlus(userMessage);
        if (medlinePlusInfo) {
          console.log(`MedlinePlus content found for tenant ${tenantId}`);
        }
      } catch (error) {
        console.log('MedlinePlus search failed:', error);
      }
    }
    
    // Build patient context
    let patientInfo = '';
    if (patientContext) {
      patientInfo = `\n\nCURRENT PATIENT: ${patientContext.firstName} ${patientContext.lastName}\n`;
      if (patientContext.medications && patientContext.medications.length > 0) {
        patientInfo += `\nACTIVE MEDICATIONS:\n`;
        patientContext.medications.forEach((med: any) => {
          const refillDate = new Date(med.nextRefillDate);
          const formattedDate = refillDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          patientInfo += `- ${med.name}: ${med.status}, may renew after ${formattedDate}\n`;
        });
      }
    }
    
    // Build knowledge base context
    let knowledgeInfo = '';
    if (knowledgeBaseData && knowledgeBaseData.length > 0) {
      knowledgeInfo = `\n\nTENANT KNOWLEDGE BASE (Tenant ID: ${tenantId}):\n`;
      knowledgeBaseData.forEach((kb: any) => {
        knowledgeInfo += `[${kb.category.toUpperCase()}] Q: ${kb.question}\nA: ${kb.answer}\nVersion: ${kb.version}\n\n`;
      });
    }
    
    // System prompt
    const systemPrompt = `You are an AI healthcare receptionist assistant for BASE Health. Your role is to help patients with their healthcare practice inquiries.${patientInfo}${knowledgeInfo}${medlinePlusInfo}

YOUR CAPABILITIES:
1. Answer questions using the tenant-specific knowledge base provided above
2. Provide operational help (directions, hours, billing contact info, parking info)
3. Share general pre-approved educational health content from MedlinePlus and knowledge base
4. Route requests you cannot handle to appropriate staff

CRITICAL LIMITATIONS:
- You CANNOT schedule, reschedule, or cancel appointments
- You CANNOT provide specific lab result values or interpret medical results
- You CANNOT diagnose or provide specific medical advice for symptoms
- You CANNOT process payments or provide specific billing amounts
- You CANNOT prescribe or change medications

ROUTING RULES - When you encounter these, respond with: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat."
- Appointment scheduling, rescheduling, or cancellation requests
- Specific medical symptoms requiring clinical assessment (pain, fever, illness)
- Specific lab result values or interpretation
- Payment or billing balance inquiries

TENANT KNOWLEDGE:
- Always prioritize information from the tenant knowledge base
- Reference the version number when using knowledge base content
- If MedlinePlus information is available, you may share it as supplementary educational content
- Always clarify that MedlinePlus information is educational, not medical advice

Be conversational, helpful, and empathetic. Keep responses concise (2-3 sentences typically).`;
    
    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.sender === 'patient' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      
      // Check if it's an invalid API key error - fall back to demo mode
      if (errorData.includes('invalid_api_key') || errorData.includes('Incorrect API key')) {
        console.log('⚠️ INVALID OPENAI API KEY DETECTED ⚠️');
        console.log('Falling back to demo mode with sample responses for tenant chat.');
        console.log('To fix: Update OPENAI_API_KEY_NEW in Supabase Dashboard > Project Settings > Edge Functions > Secrets');
        console.log('Get a new key at: https://platform.openai.com/api-keys');
        return generateDemoResponse(c, userMessage, { tenantId }, knowledgeBaseData);
      }
      
      return c.json({ error: 'Failed to get AI response', details: errorData }, response.status);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      return c.json({ error: 'No response from AI' }, 500);
    }
    
    // Detect if message should be routed to staff
    const shouldRoute = aiResponse.includes("I am unable to assist with that") ||
                        aiResponse.includes("routed this to the practice");
    
    return c.json({ 
      response: aiResponse,
      shouldRoute,
      detectedIntent: shouldRoute ? detectIntent(userMessage) : null,
      metadata: {
        tenantId,
        usedMedlinePlus: tenantConfig.useMedlinePlus && medlinePlusInfo.length > 0,
        knowledgeSourcesUsed: knowledgeBaseData.length
      }
    });
  } catch (error) {
    console.error('Error in tenant chat endpoint:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500);
  }
});

// AIRE Agent Integration - Patient Summary Service
// Based on Greenway AIRE Agent: patient-summary (ag_9f2b8c)
app.post("/make-server-66fdb7c0/summary-agent", async (c) => {
  try {
    const { messages, patientId, conversationId, intent = 'patient.summary' } = await c.req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: 'Messages array is required' }, 400);
    }
    console.log(`[AIRE Agent] Generating summary for ${messages.length} messages, patient: ${patientId || 'N/A'}`);

    const conversationText = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const assistantMessages = messages.filter((m: any) => m.role === 'assistant');

    const keyPoints: string[] = [];
    const actionItems: string[] = [];

    if (conversationText.toLowerCase().includes('appointment') || conversationText.toLowerCase().includes('schedule')) {
      keyPoints.push('Patient inquired about appointment scheduling');
      actionItems.push('Schedule follow-up appointment');
    }
    if (conversationText.toLowerCase().includes('medication') || conversationText.toLowerCase().includes('prescription')) {
      keyPoints.push('Patient discussed medication concerns');
      actionItems.push('Review current medications with provider');
    }
    if (conversationText.toLowerCase().includes('pain') || conversationText.toLowerCase().includes('symptom')) {
      keyPoints.push('Patient reported symptoms requiring assessment');
      actionItems.push('Clinical evaluation needed');
    }
    if (conversationText.toLowerCase().includes('billing') || conversationText.toLowerCase().includes('insurance')) {
      keyPoints.push('Patient has billing or insurance questions');
      actionItems.push('Billing department follow-up required');
    }
    if (conversationText.toLowerCase().includes('test result') || conversationText.toLowerCase().includes('lab')) {
      keyPoints.push('Patient asking about test results');
      actionItems.push('Ensure test results are reviewed with patient');
    }
    if (keyPoints.length === 0) keyPoints.push('Patient engaged with AI assistant for general inquiry');
    if (actionItems.length === 0) actionItems.push('No immediate action required');

    const summary = `Patient conversation summary: ${keyPoints.join('. ')}. The conversation included ${userMessages.length} patient message(s) and ${assistantMessages.length} AI response(s). ${actionItems.length > 1 ? 'Multiple actions recommended.' : actionItems[0]}`;

    const summaryResponse = {
      summary,
      keyPoints,
      actionItems,
      grounding: 0.92,
      safety: 'pass',
      metadata: { tokenCount: conversationText.length, processingTime: 125, source: 'mock-prototype', guardrails: 'hipaa-default', piiClassification: 'PHI' }
    };

    const summaryId = `summary_${patientId || 'unknown'}_${Date.now()}`;
    await kv.set(summaryId, { ...summaryResponse, patientId, conversationId, createdAt: new Date().toISOString(), sentToStaff: false });

    return c.json(summaryResponse);
  } catch (error) {
    console.error('[AIRE Agent] Error generating summary:', error);
    return c.json({ error: 'Failed to generate summary', details: error.message }, 500);
  }
});

// Send Summary to EHR Staff
app.post("/make-server-66fdb7c0/send-summary-to-ehr", async (c) => {
  try {
    const { summary, keyPoints, actionItems, recipientRole, patientId, metadata } = await c.req.json();
    if (!summary || !recipientRole || !patientId) {
      return c.json({ error: 'Summary, recipientRole, and patientId are required' }, 400);
    }
    console.log(`[EHR Integration] Sending summary to ${recipientRole} for patient ${patientId}`);

    const messageId = `ehr_message_${patientId}_${Date.now()}`;
    const ehrMessage = {
      type: 'ai-chat-summary',
      patientId,
      recipientRole,
      summary,
      keyPoints: keyPoints || [],
      actionItems: actionItems || [],
      metadata: { ...metadata, grounding: metadata?.grounding || 0, safety: metadata?.safety || 'unknown', sentAt: new Date().toISOString(), sentBy: 'ai-receptionist' },
      status: 'pending',
      read: false
    };
    await kv.set(messageId, ehrMessage);

    const historyKey = `summary_history_${patientId}`;
    const existingHistory = await kv.get(historyKey) || [];
    existingHistory.push({ messageId, summary: summary.substring(0, 100) + '...', recipientRole, sentAt: ehrMessage.metadata.sentAt, keyPointsCount: keyPoints?.length || 0, actionItemsCount: actionItems?.length || 0 });
    await kv.set(historyKey, existingHistory);

    return c.json({ success: true, messageId, message: 'Summary sent to EHR staff successfully', recipientRole, patientId });
  } catch (error) {
    console.error('[EHR Integration] Error sending summary:', error);
    return c.json({ error: 'Failed to send summary to EHR', details: error.message }, 500);
  }
});

// Get Summary History
app.get("/make-server-66fdb7c0/summary-history", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    if (!patientId) return c.json({ error: 'patientId required' }, 400);
    const history = await kv.get(`summary_history_${patientId}`) || [];
    return c.json({ patientId, summaries: history, total: history.length });
  } catch (error) {
    console.error('[Summary History] Error:', error);
    return c.json({ error: 'Failed to fetch history', details: error.message }, 500);
  }
});

// Get Pending Staff Messages
app.get("/make-server-66fdb7c0/staff-messages", async (c) => {
  try {
    const role = c.req.query('role') || 'all';
    const allMessagesWithKeys = await getKeysAndValuesByPrefix('ehr_message_');
    
    // Handle empty case
    if (!allMessagesWithKeys || allMessagesWithKeys.length === 0) {
      console.log('[Staff Messages] No messages found');
      return c.json({ role, messages: [], total: 0 });
    }
    
    // Add the database key as 'id' to each message so frontend can delete them
    const allMessages = allMessagesWithKeys.map(item => ({
      ...item.value,
      id: item.key // Include the database key as the message ID
    }));
    
    let filtered = role !== 'all' ? allMessages.filter((m: any) => m.recipientRole === role) : allMessages;
    const pending = filtered.filter((m: any) => m.status === 'pending' || !m.read);
    
    console.log(`[Staff Messages] Found ${pending.length} pending messages`);
    return c.json({ role, messages: pending, total: pending.length });
  } catch (error) {
    console.error('[Staff Messages] Error:', error);
    return c.json({ error: 'Failed to fetch messages', details: error.message }, 500);
  }
});

// DELETE endpoint to clear all staff messages
app.delete("/make-server-66fdb7c0/staff-messages", async (c) => {
  try {
    const allMessages = await getKeysAndValuesByPrefix('ehr_message_');
    const messageKeys = allMessages.map((item) => item.key);
    
    if (messageKeys.length > 0) {
      await kv.mdel(messageKeys);
      console.log('[Staff Messages] Cleared', messageKeys.length, 'messages');
    }
    
    return c.json({ success: true, cleared: messageKeys.length });
  } catch (error) {
    console.error('[Staff Messages] Clear error:', error);
    return c.json({ error: 'Failed to clear messages', details: error.message }, 500);
  }
});

// DELETE endpoint to delete a single staff message
app.delete("/make-server-66fdb7c0/staff-messages/:messageId", async (c) => {
  try {
    const messageKey = c.req.param('messageId'); // This is now the full key from the database
    
    await kv.del(messageKey);
    console.log('[Staff Messages] Deleted message:', messageKey);
    
    return c.json({ success: true, deleted: messageKey });
  } catch (error) {
    console.error('[Staff Messages] Delete error:', error);
    return c.json({ error: 'Failed to delete message', details: error.message }, 500);
  }
});

// POST endpoint to create messages (from patient app registration issues, etc)
app.post("/make-server-66fdb7c0/api/messages", async (c) => {
  try {
    const message = await c.req.json();
    console.log('[Messages API] Received message:', message);
    
    // Store in KV store with ehr_message_ prefix so it shows up in staff-messages endpoint
    const messageKey = `ehr_message_${message.id}`;
    await kv.set(messageKey, {
      ...message,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    console.log('[Messages API] Message stored with key:', messageKey);
    return c.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error('[Messages API] Error storing message:', error);
    return c.json({ error: 'Failed to store message', details: error.message }, 500);
  }
});

// FHIR Communication API - Store communication message
app.post("/make-server-66fdb7c0/store-communication", async (c) => {
  try {
    const { patientId, communication } = await c.req.json();
    if (!patientId || !communication) {
      return c.json({ error: 'patientId and communication required' }, 400);
    }

    const messageId = `comm_${patientId}_${Date.now()}`;
    const message = {
      id: messageId,
      patientId,
      ...communication,
      storedAt: new Date().toISOString()
    };

    await kv.set(messageId, message);

    // Also maintain a patient-specific index
    const patientMessages = await kv.get(`patient_comm_${patientId}`) || [];
    patientMessages.push(messageId);
    await kv.set(`patient_comm_${patientId}`, patientMessages);

    console.log(`[Communication] Stored message ${messageId} for patient ${patientId}`);
    return c.json({ id: messageId, success: true });
  } catch (error) {
    console.error('[Communication] Error storing message:', error);
    return c.json({ error: 'Failed to store communication', details: error.message }, 500);
  }
});

// Image Upload API - Upload insurance card/ID/photo
app.post("/make-server-66fdb7c0/upload-image", async (c) => {
  try {
    const { patientId, kind, fileName, contentType, base64 } = await c.req.json();
    
    if (!patientId || !kind || !fileName || !base64) {
      return c.json({ error: 'patientId, kind, fileName, and base64 are required' }, 400);
    }

    console.log(`[Image Upload] Uploading ${kind} for patient ${patientId}: ${fileName}`);

    // Create FHIR DocumentReference
    const documentId = `doc_${patientId}_${kind}_${Date.now()}`;
    const documentReference = {
      resourceType: 'DocumentReference',
      id: documentId,
      status: 'current',
      type: {
        coding: [{
          system: 'http://loinc.org',
          code: kind === 'InsuranceFront' || kind === 'InsuranceBack' ? '11506-3' : '18842-5',
          display: kind === 'InsuranceFront' || kind === 'InsuranceBack' ? 'Insurance Card' : kind === 'ID' ? 'ID Document' : 'Clinical Photo'
        }]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      date: new Date().toISOString(),
      content: [{
        attachment: {
          contentType: contentType || 'image/jpeg',
          data: base64,
          title: fileName,
          creation: new Date().toISOString()
        }
      }],
      context: {
        related: [{
          reference: `Patient/${patientId}`
        }]
      },
      meta: {
        tag: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason',
          code: kind
        }]
      }
    };

    // Store document reference
    await kv.set(documentId, documentReference);

    // Mock extracted data (in real implementation, this would use OCR)
    const extractedData: any = {};
    if (kind === 'InsuranceFront' || kind === 'InsuranceBack') {
      extractedData.extracted = {
        memberId: 'ABC' + Math.floor(Math.random() * 100000),
        plan: 'Acme PPO',
        groupNumber: 'GRP' + Math.floor(Math.random() * 10000)
      };
    }

    // Create response
    const response = {
      answer: kind === 'InsuranceFront' || kind === 'InsuranceBack' 
        ? `Thanks! I captured your insurance card ${kind === 'InsuranceFront' ? '(front)' : '(back)'}. I've extracted the member ID and plan name for your chart.`
        : kind === 'ID'
        ? 'Thanks! I\'ve received your ID document. This has been added to your chart.'
        : 'Thanks! I\'ve received your photo. This has been added to your chart.',
      facts: extractedData,
      fhirRefs: {
        DocumentReference: [documentId]
      }
    };

    console.log(`[Image Upload] Successfully uploaded ${kind} for patient ${patientId}`);
    return c.json(response);

  } catch (error) {
    console.error('[Image Upload] Error:', error);
    return c.json({ error: 'Failed to upload image', details: error.message }, 500);
  }
});

// List uploaded images
app.get("/make-server-66fdb7c0/list-images", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    const kind = c.req.query('kind');

    if (!patientId) {
      return c.json({ error: 'patientId is required' }, 400);
    }

    // Get all documents for patient
    const allDocs = await kv.getByPrefix(`doc_${patientId}_`);
    
    // Filter by kind if specified
    const filteredDocs = kind 
      ? allDocs.filter((doc: any) => doc.meta?.tag?.[0]?.code === kind)
      : allDocs;

    return c.json({
      patientId,
      kind: kind || 'all',
      documents: filteredDocs,
      total: filteredDocs.length
    });

  } catch (error) {
    console.error('[List Images] Error:', error);
    return c.json({ error: 'Failed to list images', details: error.message }, 500);
  }
});

// FHIR Communication API - Get communications for a patient
app.get("/make-server-66fdb7c0/get-communications", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    const messageIds = await kv.get(`patient_comm_${patientId}`) || [];
    
    // Handle empty array case
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      console.log(`[Communication] No messages found for patient ${patientId}`);
      return c.json({ communications: [] });
    }

    const messages = await kv.mget(messageIds);
    
    // Sort by timestamp (most recent first)
    const communications = messages
      .filter(m => m !== null)
      .sort((a: any, b: any) => new Date(b.sent).getTime() - new Date(a.sent).getTime());

    console.log(`[Communication] Retrieved ${communications.length} messages for patient ${patientId}`);
    return c.json({ communications });
  } catch (error) {
    console.error('[Communication] Error retrieving messages:', error);
    return c.json({ error: 'Failed to retrieve communications', details: error.message }, 500);
  }
});

// FHIR Communication API - Mark message as read
app.post("/make-server-66fdb7c0/mark-read", async (c) => {
  try {
    const { messageId, patientId } = await c.req.json();
    if (!messageId || !patientId) {
      return c.json({ error: 'messageId and patientId required' }, 400);
    }

    const message = await kv.get(messageId);
    if (!message) {
      return c.json({ error: 'Message not found' }, 404);
    }

    message.status = 'read';
    message.readAt = new Date().toISOString();
    await kv.set(messageId, message);

    console.log(`[Communication] Marked message ${messageId} as read`);
    return c.json({ success: true });
  } catch (error) {
    console.error('[Communication] Error marking message as read:', error);
    return c.json({ error: 'Failed to mark message as read', details: error.message }, 500);
  }
});

// Notification API - Send notification to patient
app.post("/make-server-66fdb7c0/send-notification", async (c) => {
  try {
    const { patientId, title, message, methods, data } = await c.req.json();
    if (!patientId || !message) {
      return c.json({ error: 'patientId and message required' }, 400);
    }

    const notificationId = `notif_${patientId}_${Date.now()}`;
    const notification = {
      id: notificationId,
      patientId,
      title: title || 'Message from your care team',
      message,
      methods: methods || ['push', 'email'],
      data: data || {},
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    await kv.set(notificationId, notification);

    // Store in patient's notification history
    const patientNotifications = await kv.get(`patient_notif_${patientId}`) || [];
    patientNotifications.push(notificationId);
    await kv.set(`patient_notif_${patientId}`, patientNotifications);

    console.log(`[Notification] Sent notification ${notificationId} to patient ${patientId} via ${methods.join(', ')}`);
    
    // In production, integrate with:
    // - Firebase Cloud Messaging (FCM) for push notifications
    // - Twilio for SMS
    // - SendGrid or AWS SES for email
    
    return c.json({ 
      id: notificationId, 
      success: true,
      note: 'In production, this would trigger actual push/SMS/email delivery'
    });
  } catch (error) {
    console.error('[Notification] Error sending notification:', error);
    return c.json({ error: 'Failed to send notification', details: error.message }, 500);
  }
});

// Notification API - Get notification preferences
app.get("/make-server-66fdb7c0/notification-preferences", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    const preferences = await kv.get(`patient_notif_prefs_${patientId}`) || {
      push: true,
      sms: false,
      email: true
    };

    return c.json(preferences);
  } catch (error) {
    console.error('[Notification] Error getting preferences:', error);
    return c.json({ error: 'Failed to get notification preferences', details: error.message }, 500);
  }
});

// Notification API - Get notification history for a patient
app.get("/make-server-66fdb7c0/get-notifications", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    const notificationIds = await kv.get(`patient_notif_${patientId}`) || [];
    
    // Handle empty array case
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      console.log(`[Notification] No notifications found for patient ${patientId}`);
      return c.json({ notifications: [] });
    }

    const notifications = [];
    for (const notifId of notificationIds) {
      const notification = await kv.get(notifId);
      if (notification) {
        notifications.push(notification);
      }
    }

    // Sort by sentAt descending (newest first)
    notifications.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    console.log(`[Notification] Retrieved ${notifications.length} notifications for patient ${patientId}`);
    return c.json({ notifications });
  } catch (error) {
    console.error('[Notification] Error getting notification history:', error);
    return c.json({ error: 'Failed to get notification history', details: error.message }, 500);
  }
});

// User Settings API - Get user settings
app.get("/make-server-66fdb7c0/user-settings/:patientId", async (c) => {
  try {
    const patientId = c.req.param('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    // Get user settings from KV store
    const settings = await kv.get(`user_settings_${patientId}`) || {
      id: `user_settings_${patientId}`,
      gisId: patientId,
      subType: 'patient',
      personal: {
        firstName: 'Sarah',
        middleName: 'Marie',
        lastName: 'Johnson',
        preferredName: 'Sarah',
        dob: '1990-03-15',
        gender: 'female',
        ssn: '***-**-4567'
      },
      contact: {
        address1: '123 Maple Street',
        address2: 'Apt 4B',
        city: 'Springfield',
        state: 'IL',
        zip: '62701',
        phone: '(555) 123-4567',
        email: 'sarah.johnson@email.com',
        emergencyContact: 'John Johnson',
        emergencyPhone: '(555) 987-6543',
        emergencyRelationship: 'Spouse'
      },
      preferences: {
        language: 'English',
        notificationMethods: ['push', 'email'],
        communicationPreference: 'email',
        appointmentReminders: true,
        labResultNotifications: true,
        marketingCommunications: false
      },
      security: {
        mfaEnabled: true,
        mfaMethod: 'authenticator',
        lastPasswordChange: '2024-10-15T10:30:00Z',
        loginHistory: [
          { date: '2024-11-20T09:00:00Z', device: 'iPhone 15', location: 'Springfield, IL' },
          { date: '2024-11-19T14:30:00Z', device: 'iPhone 15', location: 'Springfield, IL' },
          { date: '2024-11-18T08:15:00Z', device: 'Chrome Browser', location: 'Springfield, IL' }
        ]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`[UserSettings] Retrieved settings for patient ${patientId}`);
    return c.json({ settings });
  } catch (error) {
    console.error('[UserSettings] Error retrieving settings:', error);
    return c.json({ error: 'Failed to retrieve user settings', details: error.message }, 500);
  }
});

// User Settings API - Update user settings
app.put("/make-server-66fdb7c0/user-settings/:patientId", async (c) => {
  try {
    const patientId = c.req.param('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    const updates = await c.req.json();
    
    // Get existing settings
    const existingSettings = await kv.get(`user_settings_${patientId}`) || {
      id: `user_settings_${patientId}`,
      gisId: patientId,
      subType: 'patient',
      createdAt: new Date().toISOString()
    };

    // Merge updates with existing settings
    const updatedSettings = {
      ...existingSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save to KV store
    await kv.set(`user_settings_${patientId}`, updatedSettings);

    console.log(`[UserSettings] Updated settings for patient ${patientId}`);
    return c.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error('[UserSettings] Error updating settings:', error);
    return c.json({ error: 'Failed to update user settings', details: error.message }, 500);
  }
});

// Appointment Reminder API - Get upcoming appointment with medications
app.get("/make-server-66fdb7c0/upcoming-appointment", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    // Mock upcoming appointment (in production, fetch from EHR/FHIR)
    const appointment = {
      id: 'appt-001',
      date: 'November 25, 2024',
      time: '2:30 PM',
      provider: 'Dr. Emily Carter',
      location: 'Springfield Medical Center - Building A, Suite 301',
      type: 'Annual Physical'
    };

    // Mock medications from FHIR MedicationStatement
    const medications = [
      {
        id: 'med-001',
        name: 'Lisinopril',
        dosage: '10 mg',
        frequency: 'Once daily',
        isActive: true
      },
      {
        id: 'med-002',
        name: 'Metformin',
        dosage: '500 mg',
        frequency: 'Twice daily with meals',
        isActive: true
      },
      {
        id: 'med-003',
        name: 'Atorvastatin',
        dosage: '20 mg',
        frequency: 'Once daily at bedtime',
        isActive: true
      }
    ];

    console.log(`[Appointment] Retrieved upcoming appointment for patient ${patientId}`);
    return c.json({ appointment, medications });
  } catch (error) {
    console.error('[Appointment] Error retrieving appointment:', error);
    return c.json({ error: 'Failed to retrieve appointment', details: error.message }, 500);
  }
});

// Medication Update API - Update medication active status
app.post("/make-server-66fdb7c0/update-medications", async (c) => {
  try {
    const { patientId, medications } = await c.req.json();
    if (!patientId || !medications) {
      return c.json({ error: 'patientId and medications required' }, 400);
    }

    // Store medication updates in KV store
    const updateId = `med_update_${patientId}_${Date.now()}`;
    const update = {
      id: updateId,
      patientId,
      medications,
      updatedAt: new Date().toISOString(),
      source: 'patient_pre_visit_review'
    };

    await kv.set(updateId, update);

    // Also update the patient's medication index
    const patientMedUpdates = await kv.get(`patient_med_updates_${patientId}`) || [];
    patientMedUpdates.push(updateId);
    await kv.set(`patient_med_updates_${patientId}`, patientMedUpdates);

    console.log(`[Medication] Updated ${medications.length} medications for patient ${patientId}`);
    
    // In production, this would:
    // 1. Update FHIR MedicationStatement resources
    // 2. Create a Task for provider to review
    // 3. Send notification to care team
    
    return c.json({ 
      success: true, 
      id: updateId,
      note: 'Medication updates stored. In production, this would update FHIR resources and notify care team.'
    });
  } catch (error) {
    console.error('[Medication] Error updating medications:', error);
    return c.json({ error: 'Failed to update medications', details: error.message }, 500);
  }
});

// Pre-Visit Data API - Fetch comprehensive FHIR data for pre-visit questionnaire
app.get("/make-server-66fdb7c0/pre-visit-data", async (c) => {
  try {
    const patientId = c.req.query('patientId');
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    // In production, this would make parallel requests to HealthLake FHIR endpoints:
    // GET /Patient/{id}
    // GET /Coverage?patient={id}
    // GET /Condition?patient={id}
    // GET /Observation?patient={id}
    // GET /MedicationRequest?patient={id}&status=active
    // GET /AllergyIntolerance?patient={id}
    // GET /Procedure?patient={id}
    // GET /Immunization?patient={id}
    // GET /Encounter?patient={id}
    // GET /CarePlan?patient={id}
    // GET /DiagnosticReport?patient={id}
    // GET /Appointment?patient={id}
    // GET /DocumentReference?patient={id}

    // Mock comprehensive pre-visit data
    const preVisitData = {
      appointment: {
        id: 'appt-001',
        date: 'November 25, 2024',
        time: '2:30 PM',
        provider: 'Dr. Emily Carter',
        location: 'Springfield Medical Center - Building A, Suite 301',
        type: 'Annual Physical'
      },
      
      medications: [
        {
          id: 'med-001',
          name: 'Lisinopril',
          dosage: '10 mg',
          frequency: 'Once daily',
          isActive: true
        },
        {
          id: 'med-002',
          name: 'Metformin',
          dosage: '500 mg',
          frequency: 'Twice daily with meals',
          isActive: true
        },
        {
          id: 'med-003',
          name: 'Atorvastatin',
          dosage: '20 mg',
          frequency: 'Once daily at bedtime',
          isActive: true
        }
      ],

      vitals: [
        {
          type: 'Blood Pressure',
          value: '142/88',
          unit: 'mmHg',
          date: 'November 18, 2024',
          status: 'high',
          icon: 'Heart',
          color: 'bg-red-50 text-red-600'
        },
        {
          type: 'Blood Glucose',
          value: '118',
          unit: 'mg/dL',
          date: 'November 17, 2024',
          status: 'normal',
          icon: 'Droplet',
          color: 'bg-blue-50 text-blue-600'
        },
        {
          type: 'Weight',
          value: '175',
          unit: 'lbs',
          date: 'November 15, 2024',
          status: 'normal',
          icon: 'Weight',
          color: 'bg-green-50 text-green-600'
        },
        {
          type: 'Body Temperature',
          value: '98.6',
          unit: '°F',
          date: 'November 18, 2024',
          status: 'normal',
          icon: 'Thermometer',
          color: 'bg-purple-50 text-purple-600'
        }
      ],

      insurance: {
        provider: 'Blue Cross Blue Shield',
        plan: 'PPO Silver Plus',
        memberId: 'BCBS123456789',
        group: 'GRP-ABC-001',
        status: 'active',
        effectiveDate: 'January 1, 2024',
        copay: '$30 specialist, $20 primary care'
      },

      carePlans: [
        {
          id: 'cp-001',
          title: 'Diabetes Management',
          description: 'Type 2 Diabetes care plan with blood glucose monitoring',
          status: 'active',
          progress: 75,
          goals: [
            'Maintain A1c below 7.0%',
            'Check blood sugar twice daily',
            'Exercise 30 minutes, 5 days per week'
          ]
        },
        {
          id: 'cp-002',
          title: 'Hypertension Control',
          description: 'Blood pressure management and lifestyle modifications',
          status: 'in-progress',
          progress: 60,
          goals: [
            'Keep BP below 140/90',
            'Reduce sodium intake',
            'Take medications as prescribed'
          ]
        }
      ],

      lastEncounter: {
        id: 'enc-045',
        date: 'August 15, 2024',
        provider: 'Dr. Emily Carter',
        type: 'Follow-up Visit',
        chiefComplaint: 'Routine diabetes and hypertension follow-up',
        diagnoses: [
          'Type 2 Diabetes Mellitus (E11.9)',
          'Essential Hypertension (I10)',
          'Hyperlipidemia (E78.5)'
        ],
        followUp: 'Continue current medications, monitor blood pressure at home, return in 3 months'
      },

      conditions: [
        {
          id: 'cond-001',
          name: 'Type 2 Diabetes Mellitus',
          code: 'E11.9',
          onsetDate: 'March 2020',
          status: 'active'
        },
        {
          id: 'cond-002',
          name: 'Essential Hypertension',
          code: 'I10',
          onsetDate: 'January 2019',
          status: 'active'
        },
        {
          id: 'cond-003',
          name: 'Hyperlipidemia',
          code: 'E78.5',
          onsetDate: 'June 2018',
          status: 'active'
        }
      ],

      allergies: [
        {
          id: 'allergy-001',
          substance: 'Penicillin',
          reaction: 'Hives, itching',
          severity: 'moderate',
          recordedDate: 'January 2010'
        }
      ]
    };

    console.log(`[PreVisit] Retrieved comprehensive pre-visit data for patient ${patientId}`);
    return c.json(preVisitData);
  } catch (error) {
    console.error('[PreVisit] Error retrieving pre-visit data:', error);
    return c.json({ error: 'Failed to retrieve pre-visit data', details: error.message }, 500);
  }
});

// Pre-Visit Submission API - Store completed pre-visit questionnaire
app.post("/make-server-66fdb7c0/submit-pre-visit", async (c) => {
  try {
    const data = await c.req.json();
    const { patientId, symptoms, recentChanges, medications, vitalNotes, insuranceConfirmed, carePlans, encounterNotes, completedAt } = data;
    
    if (!patientId) {
      return c.json({ error: 'patientId required' }, 400);
    }

    // Store pre-visit submission in KV store
    const submissionId = `pre_visit_${patientId}_${Date.now()}`;
    const submission = {
      id: submissionId,
      patientId,
      symptoms,
      recentChanges,
      medications,
      vitalNotes,
      insuranceConfirmed,
      carePlans,
      encounterNotes,
      completedAt,
      status: 'submitted'
    };

    await kv.set(submissionId, submission);

    // Update patient's pre-visit submissions index
    const patientSubmissions = await kv.get(`patient_pre_visits_${patientId}`) || [];
    patientSubmissions.push(submissionId);
    await kv.set(`patient_pre_visits_${patientId}`, patientSubmissions);

    console.log(`[PreVisit] Submitted pre-visit update for patient ${patientId}`);
    
    // In production, this would:
    // 1. Update multiple FHIR resources (MedicationStatement, CarePlan, Observation, etc.)
    // 2. Create a Task for provider to review pre-visit updates
    // 3. Update Appointment resource with pre-visit completion flag
    // 4. Send notification to care team that patient completed pre-visit
    // 5. Generate a QuestionnaireResponse resource
    
    return c.json({ 
      success: true, 
      id: submissionId,
      note: 'Pre-visit update stored successfully. Provider will review before your appointment.'
    });
  } catch (error) {
    console.error('[PreVisit] Error submitting pre-visit update:', error);
    return c.json({ error: 'Failed to submit pre-visit update', details: error.message }, 500);
  }
});

// Get Pre-Visit Submissions for a Patient
app.get("/make-server-66fdb7c0/pre-visit-submissions/:patientId", async (c) => {
  try {
    const patientId = c.req.param('patientId');
    
    // Get patient's submission IDs
    const submissionIds = await kv.get(`patient_pre_visits_${patientId}`) || [];
    
    if (submissionIds.length === 0) {
      return c.json({ submissions: [] });
    }
    
    // Retrieve all submissions
    const submissions = await Promise.all(
      submissionIds.map(async (id) => {
        const submission = await kv.get(id);
        return submission;
      })
    );
    
    // Filter out any null values and sort by date (newest first)
    const validSubmissions = submissions
      .filter(s => s !== null)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    console.log(`[PreVisit] Retrieved ${validSubmissions.length} submissions for patient ${patientId}`);
    
    return c.json({ 
      patientId,
      submissions: validSubmissions
    });
  } catch (error) {
    console.error('[PreVisit] Error retrieving submissions:', error);
    return c.json({ error: 'Failed to retrieve pre-visit submissions', details: error.message }, 500);
  }
});

// ============================================
// PATIENT MATCHING & PROXY REGISTRATION
// ============================================

/**
 * Match Patient Endpoint
 * Supports both deterministic (identifier-based) and fuzzy (demographics-based) matching
 * 
 * Request body:
 * {
 *   "healthlakeBase": "https://healthlake-endpoint/fhir",
 *   "identifiers": [{ "system": "...", "value": "..." }], // Optional
 *   "family": "LastName", // Optional
 *   "given": "FirstName", // Optional
 *   "birthDate": "YYYY-MM-DD", // Optional
 *   "gender": "male|female|other", // Optional
 *   "phone": "+1234567890", // Optional
 *   "email": "email@example.com" // Optional
 * }
 */
app.post("/make-server-66fdb7c0/api/matchPatient", async (c) => {
  try {
    const requestData = await c.req.json();
    const { 
      healthlakeBase, 
      identifiers, 
      family, 
      given, 
      birthDate, 
      gender, 
      phone, 
      email 
    } = requestData;

    // For demo purposes, we'll use mock FHIR data
    // In production, you would fetch from actual HealthLake using the healthlakeBase
    console.log('========== PATIENT MATCH API CALLED ==========');
    console.log('[Patient Match] Request Data:', requestData);
    console.log('[Patient Match] Matching patient with criteria:', { identifiers, family, given, birthDate });

    // Mock FHIR patients for demo
    const mockPatients = [
      {
        resourceType: 'Patient',
        id: 'patient-001',
        identifier: [
          { system: 'http://hospital.example.org/mrn', value: '12345' },
          { system: 'http://hl7.org/fhir/sid/us-ssn', value: '123-45-6789' },
          { system: 'http://hospital.example.org/billing-account', value: 'BA-98765' }
        ],
        name: [{ family: 'Johnson', given: ['Sarah'] }],
        birthDate: '1985-03-15',
        gender: 'female',
        address: [
          {
            use: 'home',
            line: ['123 Oak Street'],
            city: 'Madison',
            state: 'CA',
            postalCode: '95653',
            country: 'US'
          }
        ],
        telecom: [
          { system: 'phone', value: '+1-555-0101', use: 'mobile' },
          { system: 'email', value: 'sarah.johnson@email.com' }
        ]
      },
      {
        resourceType: 'Patient',
        id: 'patient-002',
        identifier: [
          { system: 'http://hospital.example.org/mrn', value: '67890' },
          { system: 'http://hospital.example.org/billing-account', value: 'BA-54321' }
        ],
        name: [{ family: 'Harbin', given: ['Mandy'] }],
        birthDate: '1986-05-12',
        gender: 'female',
        address: [
          {
            use: 'home',
            line: ['456 Maple Avenue'],
            city: 'Sacramento',
            state: 'CA',
            postalCode: '95814',
            country: 'US'
          }
        ],
        telecom: [
          { system: 'phone', value: '+1-555-0202', use: 'mobile' },
          { system: 'email', value: 'mandy.harbin@email.com' }
        ]
      },
      {
        resourceType: 'Patient',
        id: 'patient-003',
        identifier: [
          { system: 'http://hospital.example.org/mrn', value: '11111' },
          { system: 'http://hospital.example.org/billing-account', value: 'BA-11111' }
        ],
        name: [{ family: 'Smith', given: ['John'] }],
        birthDate: '1990-07-20',
        gender: 'male',
        address: [
          {
            use: 'home',
            line: ['789 Pine Road'],
            city: 'Folsom',
            state: 'CA',
            postalCode: '95630',
            country: 'US'
          }
        ],
        telecom: [
          { system: 'phone', value: '+1-555-0303', use: 'mobile' }
        ]
      },
      {
        resourceType: 'Patient',
        id: 'patient-004',
        identifier: [
          { system: 'http://hospital.example.org/mrn', value: 'MRN-54321' },
          { system: 'http://hospital.example.org/billing-account', value: '12345' }
        ],
        name: [{ family: 'Thompson', given: ['Amanda'] }],
        birthDate: '1985-01-15',
        gender: 'female',
        address: [
          {
            use: 'home',
            line: ['456 Peachtree St'],
            city: 'Atlanta',
            state: 'GA',
            postalCode: '30308',
            country: 'US'
          }
        ],
        telecom: [
          { system: 'phone', value: '+1-404-555-0123', use: 'mobile' },
          { system: 'email', value: 'amanda.thompson@email.com' }
        ]
      },
      {
        resourceType: 'Patient',
        id: 'patient-005',
        identifier: [
          { system: 'http://hospital.example.org/mrn', value: 'MRN-67890' },
          { system: 'http://hospital.example.org/billing-account', value: '67890' }
        ],
        name: [{ family: 'Johnson', given: ['David'] }],
        birthDate: '1985-03-15',
        gender: 'male',
        address: [
          {
            use: 'home',
            line: ['789 Main St'],
            city: 'Roseville',
            state: 'CA',
            postalCode: '95653',
            country: 'US'
          }
        ],
        telecom: [
          { system: 'phone', value: '+1-916-555-0404', use: 'mobile' },
          { system: 'email', value: 'david.johnson@email.com' }
        ]
      }
    ];

    // Build criteria for matching
    const matchCriteria: {
      identifiers?: PatientIdentifier[];
      demographics?: PatientDemographics;
    } = {};

    if (identifiers && identifiers.length > 0) {
      matchCriteria.identifiers = identifiers;
    }

    if (family || given || birthDate || gender) {
      matchCriteria.demographics = {
        family,
        given,
        birthDate,
        gender,
        phone,
        email
      };
    }

    // Perform matching
    const results = matchPatient(mockPatients, matchCriteria);
    console.log('[Patient Match] Match Results:', {
      deterministic: results.deterministic.length,
      fuzzy: results.fuzzy.length
    });
    if (results.deterministic.length > 0) {
      console.log('[Patient Match] Deterministic matches:', results.deterministic);
    }
    if (results.fuzzy.length > 0) {
      console.log('[Patient Match] Fuzzy matches:', results.fuzzy);
    }

    // Return results
    if (results.deterministic.length > 0) {
      console.log(`[Patient Match] Returning ${results.deterministic.length} deterministic match(es)`);
      return c.json({
        matchType: 'deterministic',
        matches: results.deterministic,
        count: results.deterministic.length
      });
    } else if (results.fuzzy.length > 0) {
      console.log(`[Patient Match] Found ${results.fuzzy.length} fuzzy match candidate(s)`);
      return c.json({
        matchType: 'fuzzy',
        candidates: results.fuzzy.map(candidate => ({
          patient: candidate.patient,
          score: candidate.score,
          matchType: candidate.matchType,
          matchedFields: candidate.matchedFields,
          confidence: candidate.matchType === 'exact' ? 'High' : 
                      candidate.matchType === 'high' ? 'Medium-High' :
                      candidate.matchType === 'medium' ? 'Medium' : 'Low'
        })),
        count: results.fuzzy.length
      });
    } else {
      console.log('[Patient Match] No matches found');
      return c.json({
        matchType: 'none',
        matches: [],
        candidates: [],
        count: 0,
        message: 'No matching patients found'
      });
    }
  } catch (error) {
    console.error('[Patient Match] Error:', error);
    return c.json({ 
      error: 'Failed to match patient', 
      details: error.message 
    }, 500);
  }
});

/**
 * Register Proxy Endpoint
 * Creates RelatedPerson, Consent, and Provenance resources for authorized representative
 * 
 * Request body:
 * {
 *   "healthlakeBase": "https://healthlake-endpoint/fhir",
 *   "patientId": "patient-123",
 *   "proxy": {
 *     "name": { "family": "Doe", "given": "John" },
 *     "telecom": [{ "system": "phone", "value": "+1234567890", "use": "mobile" }],
 *     "relationship": { "code": "GUARD", "display": "guardian" },
 *     "identifier": { "system": "...", "value": "..." }
 *   },
 *   "consent": {
 *     "period": { "start": "2025-11-21", "end": "2026-11-21" },
 *     "scopes": ["access"]
 *   }
 * }
 */
app.post("/make-server-66fdb7c0/api/registerProxy", async (c) => {
  try {
    const requestData = await c.req.json();
    const { healthlakeBase, patientId, proxy, consent } = requestData;

    if (!patientId || !proxy) {
      return c.json({ 
        error: 'patientId and proxy data are required' 
      }, 400);
    }

    console.log('[Proxy Registration] Registering proxy for patient:', patientId);

    // For demo purposes, we'll create mock responses
    // In production, you would use createRelatedPerson, createConsent, createProvenance

    // Create RelatedPerson resource
    const relatedPersonId = `relatedperson-${Date.now()}`;
    const relatedPersonResource = {
      resourceType: 'RelatedPerson',
      id: relatedPersonId,
      identifier: proxy.identifier ? [proxy.identifier] : [],
      active: true,
      patient: {
        reference: `Patient/${patientId}`,
        display: 'Patient'
      },
      relationship: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-RoleCode',
              code: proxy.relationship.code,
              display: proxy.relationship.display
            }
          ],
          text: proxy.relationship.display
        }
      ],
      name: [proxy.name],
      telecom: proxy.telecom || [],
      meta: {
        lastUpdated: new Date().toISOString(),
        versionId: '1'
      }
    };

    // Create Consent resource
    const consentId = `consent-${Date.now()}`;
    const consentResource = {
      resourceType: 'Consent',
      id: consentId,
      status: 'active',
      scope: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/consentscope',
            code: 'patient-privacy',
            display: 'Privacy Consent'
          }
        ]
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
              code: 'IDSCL',
              display: 'information disclosure'
            }
          ]
        }
      ],
      patient: {
        reference: `Patient/${patientId}`
      },
      dateTime: new Date().toISOString(),
      performer: [
        {
          reference: `RelatedPerson/${relatedPersonId}`
        }
      ],
      provision: {
        type: 'permit',
        period: consent?.period || {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        },
        actor: [
          {
            role: {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                  code: 'IRCP',
                  display: 'information recipient'
                }
              ]
            },
            reference: {
              reference: `RelatedPerson/${relatedPersonId}`
            }
          }
        ],
        action: consent?.scopes?.map((scope: string) => ({
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/consentaction',
              code: scope,
              display: scope
            }
          ]
        })) || [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/consentaction',
                code: 'access',
                display: 'Access'
              }
            ]
          }
        ]
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        versionId: '1'
      }
    };

    // Create Provenance resource
    const provenanceId = `provenance-${Date.now()}`;
    const provenanceResource = {
      resourceType: 'Provenance',
      id: provenanceId,
      target: [
        {
          reference: `RelatedPerson/${relatedPersonId}`
        },
        {
          reference: `Consent/${consentId}`
        }
      ],
      recorded: new Date().toISOString(),
      agent: [
        {
          type: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/provenance-participant-type',
                code: 'enterer',
                display: 'Enterer'
              }
            ]
          },
          who: {
            reference: `RelatedPerson/${relatedPersonId}`,
            display: `${proxy.name.given} ${proxy.name.family}`
          }
        }
      ],
      activity: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-DataOperation',
            code: 'CREATE',
            display: 'create'
          }
        ]
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        versionId: '1'
      }
    };

    // Store in KV store for demo
    await kv.set(`relatedperson:${relatedPersonId}`, relatedPersonResource);
    await kv.set(`consent:${consentId}`, consentResource);
    await kv.set(`provenance:${provenanceId}`, provenanceResource);

    console.log('[Proxy Registration] Successfully created resources');

    return c.json({
      success: true,
      resources: {
        relatedPerson: relatedPersonResource,
        consent: consentResource,
        provenance: provenanceResource
      },
      message: 'Proxy registration completed successfully'
    });
  } catch (error) {
    console.error('[Proxy Registration] Error:', error);
    return c.json({ 
      error: 'Failed to register proxy', 
      details: error.message 
    }, 500);
  }
});

// Patient Matching Endpoint - Link portal account to EHR patient
app.post("/make-server-66fdb7c0/patient-match", async (c) => {
  try {
    const { 
      messageId, 
      portalAccountInfo, 
      ehrPatient, 
      matchedBy 
    } = await c.req.json();

    console.log('[Patient Match] Processing match request:', {
      messageId,
      portalName: portalAccountInfo?.name,
      ehrPatientId: ehrPatient?.id,
      ehrPatientName: ehrPatient?.name,
      matchedBy
    });

    const now = new Date().toISOString();
    const matchId = `match-${Date.now()}`;

    // 1. Store the patient match in KV store for audit trail
    const matchRecord = {
      matchId,
      messageId,
      portalAccountInfo: {
        name: portalAccountInfo.name,
        dob: portalAccountInfo.dob,
        zip: portalAccountInfo.zip,
        account: portalAccountInfo.account
      },
      ehrPatient: {
        id: ehrPatient.id,
        name: ehrPatient.name,
        dob: ehrPatient.dob,
        mrn: ehrPatient.mrn,
        patientId: ehrPatient.patientId
      },
      matchedBy,
      matchedAt: now,
      status: 'completed'
    };

    await kv.set(`patient-match:${matchId}`, matchRecord);

    // 2. Store portal account activation (in production, this would update the portal user record)
    const portalActivation = {
      portalAccountId: portalAccountInfo.name.toLowerCase().replace(/\s+/g, '-'),
      linkedEhrPatientId: ehrPatient.id,
      linkedEhrMrn: ehrPatient.mrn,
      activatedAt: now,
      activatedBy: matchedBy,
      contactMethod: portalAccountInfo.contactMethod,
      contactInfo: portalAccountInfo.contactInfo
    };

    await kv.set(`portal-activation:${ehrPatient.id}`, portalActivation);

    // 3. Create notification record (simulated - in production would trigger email/SMS)
    const registrationLink = `https://portal.greenwayhealth.com/register?token=${matchId}`;
    const notification = {
      notificationId: `notif-${Date.now()}`,
      patientId: ehrPatient.id,
      type: 'portal_registration_link',
      method: portalAccountInfo.contactMethod || 'Phone',
      destination: portalAccountInfo.contactInfo || 'N/A',
      message: `Hi ${portalAccountInfo.name.split(' ')[0]}, your identity has been verified! Click the link below to complete your patient portal registration and create your username and password: ${registrationLink}`,
      link: registrationLink,
      sentAt: now,
      status: 'simulated' // In production: 'sent' or 'pending'
    };

    await kv.set(`notification:${notification.notificationId}`, notification);

    console.log('[Patient Match] Successfully processed:', {
      matchId,
      notificationId: notification.notificationId,
      patientId: ehrPatient.id
    });

    // 4. Return success response
    return c.json({
      success: true,
      matchId,
      portalActivation,
      notification: {
        id: notification.notificationId,
        method: notification.method,
        destination: notification.destination,
        status: notification.status
      },
      message: 'Patient successfully matched and portal access granted'
    });

  } catch (error) {
    console.error('[Patient Match] Error:', error);
    return c.json({ 
      error: 'Failed to match patient', 
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);