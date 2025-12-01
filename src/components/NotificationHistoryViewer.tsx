import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Bell, Mail, Smartphone, MessageCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Notification {
  id: string;
  patientId: string;
  title: string;
  message: string;
  methods: ('push' | 'sms' | 'email')[];
  status: string;
  sentAt: string;
}

interface NotificationHistoryViewerProps {
  patientId: string;
  patientName?: string;
}

export function NotificationHistoryViewer({ patientId, patientName = "Patient" }: NotificationHistoryViewerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-66fdb7c0/get-notifications?patientId=${patientId}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
            "Accept": "application/json"
          }
        }
      );

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [patientId]);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'push':
        return <Bell className="w-3 h-3" />;
      case 'sms':
        return <Smartphone className="w-3 h-3" />;
      case 'email':
        return <Mail className="w-3 h-3" />;
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'push':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'sms':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'email':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-600" />
              Notification History
            </CardTitle>
            <CardDescription>
              Simulated notifications for {patientName}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <div className="text-sm">No notifications sent yet</div>
            <div className="text-xs mt-1">Notifications will appear here when staff replies</div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-sm mb-1">{notification.title}</div>
                    <div className="text-xs text-gray-600">{notification.message}</div>
                  </div>
                  <Badge className="bg-green-600 text-xs ml-2">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sent
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex gap-1">
                    {notification.methods.map((method) => (
                      <Badge 
                        key={method}
                        variant="outline" 
                        className={`text-xs ${getMethodColor(method)}`}
                      >
                        {getMethodIcon(method)}
                        <span className="ml-1 capitalize">{method}</span>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.sentAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <Bell className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Note:</strong> These are simulated notifications. In production, these would trigger:
                <ul className="list-disc list-inside mt-1 space-y-0.5 ml-2">
                  <li><strong>Push:</strong> Firebase Cloud Messaging to patient's mobile device</li>
                  <li><strong>SMS:</strong> Twilio text message to patient's phone number</li>
                  <li><strong>Email:</strong> SendGrid email to patient's email address</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
