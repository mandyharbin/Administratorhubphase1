// Notification API for push, SMS, and email notifications
import { projectId, publicAnonKey } from '../utils/supabase/info';

const NOTIFICATION_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0`;

export interface NotificationPayload {
  patientId: string;
  message: string;
  methods: ('push' | 'sms' | 'email')[];
  title?: string;
  type?: 'message' | 'appointment' | 'alert' | 'reminder';
}

export async function sendNotification(
  patientId: string,
  message: string,
  methods: ('push' | 'sms' | 'email')[] = ['push'],
  title?: string,
  accessToken?: string
): Promise<void> {
  try {
    const response = await fetch(`${NOTIFICATION_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken || publicAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        patientId,
        message,
        methods,
        title,
        type: 'message'
      })
    });

    if (!response.ok) {
      console.error('Notification API error:', response.status);
      throw new Error('Failed to send notification');
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

export async function sendChatReplyNotification(
  patientId: string,
  senderName: string,
  messagePreview: string,
  accessToken?: string
): Promise<void> {
  const message = `${senderName} replied: ${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? '...' : ''}`;
  return sendNotification(
    patientId,
    message,
    ['push', 'sms', 'email'],
    'New Message from Care Team',
    accessToken
  );
}
