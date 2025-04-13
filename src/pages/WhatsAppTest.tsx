import React from 'react';
import { WhatsAppNotifier } from '@/components/ui/whatsapp-notifier';
import { WhatsAppBulkNotifier } from '@/components/ui/whatsapp-bulk-notifier';
import { WhatsAppHookExample } from '@/components/examples/WhatsAppHookExample';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function WhatsAppTest() {
  // Sample data for bulk messaging
  const sampleRecipients = [
    { id: '1', name: 'John Doe', phone: '919876543210' },
    { id: '2', name: 'Jane Smith', phone: '919876543211' },
    { id: '3', name: 'Robert Johnson', phone: '919876543212' },
    { id: '4', name: 'Emily Davis', phone: '919876543213' },
    { id: '5', name: 'Michael Wilson', phone: '919876543214' },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">WhatsApp Messaging Test</h1>
        
        <Tabs defaultValue="single" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Message</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Messages</TabsTrigger>
            <TabsTrigger value="hook">Hook Example</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Send Individual WhatsApp Message</CardTitle>
                <CardDescription>
                  Test sending a WhatsApp message to a single recipient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WhatsAppNotifier
                  defaultMessage="Hello from Shiksha! This is a test message."
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk">
            <WhatsAppBulkNotifier
              recipients={sampleRecipients}
              defaultMessage="Hello from Shiksha! This is a bulk test message."
              title="Send Bulk WhatsApp Messages"
              description="Test sending messages to multiple recipients"
            />
          </TabsContent>
          
          <TabsContent value="hook">
            <WhatsAppHookExample />
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">How to Use WhatsApp Messaging</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Step 1: Activate Your Phone</h3>
              <p className="text-muted-foreground">
                Before using this feature, you need to activate your phone with Callmebot by sending 
                "I allow callmebot to send me messages" to +34 644 63 38 92 via WhatsApp.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 2: Enter Phone Number</h3>
              <p className="text-muted-foreground">
                Enter the recipient's phone number with country code but without any symbols.
                For example: 919876543210 (91 is the country code for India)
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 3: Enter Message</h3>
              <p className="text-muted-foreground">
                Type your message in the text area. The message can include text, emojis, and line breaks.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Step 4: Send Message</h3>
              <p className="text-muted-foreground">
                Click the "Send WhatsApp Message" button to send your message.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="text-lg font-medium text-amber-800">Important Notes</h3>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-amber-700">
            <li>
              This integration uses the free Callmebot API, which has certain limitations.
            </li>
            <li>
              Messages are sent from the Callmebot service, not directly from your application.
            </li>
            <li>
              There may be rate limits on the number of messages you can send in a given time period.
            </li>
            <li>
              For production use with higher volumes, consider upgrading to a paid WhatsApp Business API.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}