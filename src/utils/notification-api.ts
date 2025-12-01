// Notification API for sending push notifications, SMS, and email to patients
import { projectId, publicAnonKey } from './supabase/info';

export type NotificationMethod = 'push' | 'sms' | 'email';

export interface NotificationPayload {
  patientId: string;
  title: string;
  message: string;
  methods: NotificationMethod[];
  data?: Record<string, any>;
}

// Send notification to patient via configured methods (push/SMS/email)
export async function sendNotification(
  patientId: string,
  message: string,
  title: string = "Message from your care team",
  methods: NotificationMethod[] = ['push', 'email']
): Promise<void> {
  const payload: NotificationPayload = {
    patientId,
    title,
    message,
    methods,
    data: {
      type: 'staff_message',
      timestamp: new Date().toISOString()
    }
  };

  try {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/send-notification`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!res.ok) {
      const error = await res.text();
      console.error('Failed to send notification:', error);
      throw new Error(`Failed to send notification: ${error}`);
    }

    const data = await res.json();
    console.log('Notification sent successfully:', data);
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Send push notification specifically
export async function sendPushNotification(
  patientId: string,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  await sendNotification(patientId, body, title, ['push']);
}

// Send email notification specifically
export async function sendEmailNotification(
  patientId: string,
  subject: string,
  body: string
): Promise<void> {
  await sendNotification(patientId, body, subject, ['email']);
}

// Send SMS notification specifically
export async function sendSMSNotification(
  patientId: string,
  message: string
): Promise<void> {
  await sendNotification(patientId, message, "Care Team Message", ['sms']);
}

// Get notification preferences for a patient
export async function getNotificationPreferences(patientId: string): Promise<{
  push: boolean;
  sms: boolean;
  email: boolean;
}> {
  try {
    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/notification-preferences?patientId=${patientId}`,
      {
        headers: {
          "Authorization": `Bearer ${publicAnonKey}`,
          "Accept": "application/json"
        }
      }
    );

    if (!res.ok) {
      return { push: true, sms: false, email: true }; // Defaults
    }

    return await res.json();
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return { push: true, sms: false, email: true }; // Defaults
  }
}
