// FHIR Communication API for secure messaging between staff and patients
import { projectId, publicAnonKey } from './supabase/info';

export interface ChatMessage {
  id: string;
  text: string;
  senderType: 'patient' | 'doctor' | 'staff';
  senderName?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

// Send a chat message as a FHIR Communication resource
export async function sendChatMessage(
  patientId: string,
  text: string,
  senderType: 'patient' | 'staff' = 'patient',
  senderName?: string
): Promise<ChatMessage> {
  const body = {
    resourceType: "Communication",
    status: "completed",
    subject: { reference: `Patient/${patientId}` },
    recipient: senderType === 'patient' 
      ? [{ reference: "Practitioner/doctor-id" }]
      : [{ reference: `Patient/${patientId}` }],
    sender: senderType === 'staff' 
      ? { reference: `Practitioner/${senderName || 'staff-001'}` }
      : { reference: `Patient/${patientId}` },
    sent: new Date().toISOString(),
    payload: [{ contentString: text }]
  };

  try {
    // Store in backend
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/store-communication`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          patientId,
          communication: body
        })
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to send chat message: ${error}`);
    }

    const data = await res.json();
    
    return {
      id: data.id || Date.now().toString(),
      text,
      senderType,
      senderName,
      timestamp: body.sent,
      status: 'sent'
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// Retrieve chat messages for a patient
export async function getChatMessages(patientId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/get-communications?patientId=${patientId}`,
      {
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Accept": "application/json"
        }
      }
    );

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to load messages: ${error}`);
    }

    const data = await res.json();
    
    return (data.communications || []).map((comm: any) => ({
      id: comm.id,
      text: comm.payload?.[0]?.contentString || "",
      senderType: comm.sender?.reference?.startsWith("Practitioner") ? "staff" : "patient",
      senderName: comm.sender?.display || undefined,
      timestamp: comm.sent,
      status: comm.status === 'completed' ? 'delivered' : 'sent'
    }));
  } catch (error) {
    console.error('Error loading chat messages:', error);
    return [];
  }
}

// Mark message as read
export async function markMessageAsRead(messageId: string, patientId: string): Promise<void> {
  try {
    await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/mark-read`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messageId,
          patientId
        })
      }
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}
