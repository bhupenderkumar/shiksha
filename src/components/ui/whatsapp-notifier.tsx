import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendWhatsAppMessage, isValidPhoneNumber } from '@/lib/whatsapp-utils';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';

interface WhatsAppNotifierProps {
  defaultPhone?: string;
  defaultMessage?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function WhatsAppNotifier({
  defaultPhone = '',
  defaultMessage = '',
  onSuccess,
  onError,
  className = '',
}: WhatsAppNotifierProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!phone || !message) {
      toast.error('Please provide both phone number and message');
      onError?.('Missing required fields');
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      toast.error('Invalid phone number format');
      onError?.('Invalid phone number format');
      return;
    }

    setLoading(true);
    try {
      const success = await sendWhatsAppMessage({
        phone,
        text: message,
      }, false); // Don't show toast here as we'll handle it manually

      if (success) {
        toast.success('WhatsApp message sent successfully');
        onSuccess?.();
      } else {
        toast.error('Failed to send WhatsApp message');
        onError?.('API request failed');
      }
    } catch (error) {
      toast.error('Error sending WhatsApp message');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone Number (with country code, e.g., 919876543210)
        </label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="919876543210"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-1">
          Message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here"
          rows={4}
          disabled={loading}
        />
      </div>

      <Button 
        onClick={handleSendMessage} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Sending...' : 'Send WhatsApp Message'}
      </Button>

      <div className="text-xs text-muted-foreground mt-2">
        <p>
          Note: First-time users need to activate their phone with Callmebot by sending 
          "I allow callmebot to send me messages" to +34 644 63 38 92
        </p>
      </div>
    </div>
  );
}