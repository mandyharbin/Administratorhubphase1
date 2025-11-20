import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-66fdb7c0/health", (c) => {
  return c.json({ status: "ok" });
});

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

ROUTING RULES - When you encounter these, respond with: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat."
- Appointment scheduling, rescheduling, or cancellation requests
- Specific medical symptoms requiring clinical assessment (pain, fever, illness)
- Specific lab result values or interpretation
- Payment or billing balance inquiries

HEALTH EDUCATION GUIDELINES:
- When MedlinePlus information is available, you may share it as general educational content
- Always clarify that this is educational information, not medical advice
- For specific medical concerns, still route to clinical staff

SAMPLE PATIENT DATA (for demo purposes):
- Next appointment: November 20th at 3:30 PM with Dr. Smith
- Active prescription: Lisinopril (not due for renewal until Dec 1st 2025)
- Recent lab work: Ordered January 10th (provider will review and contact if needed)
- Practice location: 123 Health Plaza, Suite 200
- Hours: Monday-Friday 7:00 AM - 7:00 PM, Saturday 9:00 AM - 1:00 PM
- Billing office: (555) 123-4567, Monday-Friday 8:00 AM - 5:00 PM
- Parking: Free in north lot

SPECIFIC RESPONSES FOR COMMON QUESTIONS:
- When asked about "next appointment" or "upcoming appointment": "Your next appointment is November 20th at 3:30 PM with Dr. Smith."
- When asked about "prescription status": "I see you have an active prescription for Lisinopril and it is not due for renewal until Dec 1st 2025."

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
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
      shouldRoute: true,
      detectedIntent: 'appointment_scheduling'
    });
  }
  
  // Test Scenario 2: When is my next appointment - Direct answer (no routing)
  if ((lowerMsg.includes('next') || lowerMsg.includes('upcoming')) && lowerMsg.includes('appointment')) {
    return c.json({ 
      response: "Your next appointment is November 20th at 3:30 PM with Dr. Smith.",
      shouldRoute: false,
      detectedIntent: null
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
  
  // Medical symptoms - Route to staff
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
    detectedIntent: 'general_routing'
  });
}

// Function to generate demo responses with MedlinePlus
async function generateDemoResponseWithMedline(c: any, userMessage: string, patientContext?: any, knowledgeBase?: any[], locations?: any[], useMedlinePlus?: boolean): any {
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
      response: "I am unable to assist with that but I have routed this to the practice. You will get a response soon here in the chat.",
      shouldRoute: true,
      detectedIntent: 'appointment_scheduling'
    });
  }
  
  // Test Scenario 2: When is my next appointment - Direct answer (no routing)
  if ((lowerMsg.includes('next') || lowerMsg.includes('upcoming')) && lowerMsg.includes('appointment')) {
    return c.json({ 
      response: "Your next appointment is November 20th at 3:30 PM with Dr. Smith.",
      shouldRoute: false,
      detectedIntent: null
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

Deno.serve(app.fetch);