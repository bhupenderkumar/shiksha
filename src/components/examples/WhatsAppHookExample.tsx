import React, { useState } from 'react';
import { useWhatsAppMessaging } from '@/hooks/useWhatsAppMessaging';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

export function WhatsAppHookExample() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  
  // Use the WhatsApp messaging hook
  const { loading, error, lastResult, sendMessage } = useWhatsAppMessaging({
    onSuccess: () => {
      // Clear form after successful send
      setPhone('');
      setMessage('');
      toast.success('Message sent successfully!');
    },
    onError: (err) => {
      toast.error(`Error: ${err}`);
    },
    // We set showToasts to false because we're handling toasts manually in onSuccess/onError
    showToasts: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || !message) {
      toast.error('Please provide both phone number and message');
      return;
    }
    
    await sendMessage({
      phone,
      text: message
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Messaging (Hook Example)</CardTitle>
        <CardDescription>
          Example using the useWhatsAppMessaging hook
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="hook-phone" className="block text-sm font-medium mb-1">
              Phone Number (with country code)
            </label>
            <Input
              id="hook-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="919876543210"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="hook-message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <Textarea
              id="hook-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here"
              rows={3}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          {lastResult && (
            <div className="flex items-center gap-2">
              <Badge variant={lastResult.success ? "success" : "destructive"}>
                {lastResult.success ? 'Sent' : 'Failed'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last attempt: {lastResult.success ? 'Message sent successfully' : 'Failed to send message'}
              </span>
            </div>
          )}
        </form>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !phone || !message}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </CardFooter>
    </Card>
  );
}