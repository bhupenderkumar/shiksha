import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { sendBulkWhatsAppMessages } from '@/lib/whatsapp-utils';
import { toast } from 'react-hot-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Recipient {
  id: string;
  name: string;
  phone: string;
}

interface WhatsAppBulkNotifierProps {
  recipients: Recipient[];
  defaultMessage?: string;
  onSuccess?: (successCount: number) => void;
  onError?: (errorCount: number) => void;
  className?: string;
  title?: string;
  description?: string;
}

export function WhatsAppBulkNotifier({
  recipients,
  defaultMessage = '',
  onSuccess,
  onError,
  className = '',
  title = 'Send WhatsApp Notifications',
  description = 'Send WhatsApp messages to multiple recipients'
}: WhatsAppBulkNotifierProps) {
  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      // If currently all selected, deselect all
      setSelectedRecipients(new Set());
    } else {
      // Otherwise select all
      const allIds = new Set(recipients.map(r => r.id));
      setSelectedRecipients(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual recipient selection
  const handleRecipientToggle = (id: string) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipients(newSelected);
    
    // Update selectAll state based on whether all recipients are selected
    setSelectAll(newSelected.size === recipients.length);
  };

  const handleSendMessages = async () => {
    if (!message) {
      toast.error('Please provide a message');
      return;
    }

    if (selectedRecipients.size === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setLoading(true);
    try {
      // Get phone numbers of selected recipients
      const selectedPhones = recipients
        .filter(r => selectedRecipients.has(r.id))
        .map(r => r.phone);

      // Send messages
      const result = await sendBulkWhatsAppMessages(selectedPhones, message);

      // Handle success/failure
      if (result.success.length > 0) {
        onSuccess?.(result.success.length);
      }
      
      if (result.failed.length > 0) {
        onError?.(result.failed.length);
      }
    } catch (error) {
      toast.error('Error sending WhatsApp messages');
      console.error('Error sending bulk WhatsApp messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div>
          <div className="flex items-center mb-2">
            <Checkbox 
              id="select-all" 
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="ml-2 text-sm font-medium">
              Select All Recipients ({recipients.length})
            </label>
          </div>
          
          <ScrollArea className="h-60 border rounded-md p-2">
            <div className="space-y-2">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center">
                  <Checkbox 
                    id={`recipient-${recipient.id}`}
                    checked={selectedRecipients.has(recipient.id)}
                    onCheckedChange={() => handleRecipientToggle(recipient.id)}
                  />
                  <label 
                    htmlFor={`recipient-${recipient.id}`} 
                    className="ml-2 text-sm"
                  >
                    {recipient.name} ({recipient.phone})
                  </label>
                </div>
              ))}
              
              {recipients.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No recipients available
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleSendMessages} 
          disabled={loading || selectedRecipients.size === 0 || !message}
          className="w-full"
        >
          {loading 
            ? `Sending to ${selectedRecipients.size} recipient(s)...` 
            : `Send to ${selectedRecipients.size} recipient(s)`
          }
        </Button>
      </CardFooter>
    </Card>
  );
}