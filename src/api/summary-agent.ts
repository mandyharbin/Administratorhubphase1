import { projectId, publicAnonKey } from '../utils/supabase/info';

const SUMMARY_AGENT_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/summary-agent`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface SummaryRequest {
  messages: ChatMessage[];
  patientId?: string;
  conversationId?: string;
  intent?: string;
}

export interface SummaryResponse {
  summary: string;
  keyPoints?: string[];
  actionItems?: string[];
  grounding: number;
  safety: 'pass' | 'fail';
  metadata?: {
    tokenCount?: number;
    processingTime?: number;
  };
}

/**
 * Call the Greenway AIRE patient summary agent
 * Endpoint: https://agents.prod/summary/v1/invoke
 */
export async function generatePatientSummary(request: SummaryRequest): Promise<SummaryResponse> {
  try {
    const response = await fetch(SUMMARY_AGENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Summary agent error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling summary agent:', error);
    throw error;
  }
}

/**
 * Send summary to EHR staff
 */
export async function sendSummaryToStaff(summary: SummaryResponse, recipientRole: string, patientId: string) {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/send-summary-to-ehr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        summary: summary.summary,
        keyPoints: summary.keyPoints,
        actionItems: summary.actionItems,
        recipientRole,
        patientId,
        metadata: {
          grounding: summary.grounding,
          safety: summary.safety,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to send summary: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending summary to EHR:', error);
    throw error;
  }
}

/**
 * Get summary history for a patient
 */
export async function getSummaryHistory(patientId: string) {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/summary-history?patientId=${patientId}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch summary history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching summary history:', error);
    throw error;
  }
}
