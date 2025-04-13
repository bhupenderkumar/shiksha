# WhatsApp Messaging Integration

This document explains how to use the WhatsApp messaging functionality in your application.

## Overview

The WhatsApp messaging integration uses the free Callmebot API to send WhatsApp messages from your application. This allows you to send notifications, alerts, and other messages to users via WhatsApp.

## Prerequisites

Before using this functionality, recipients need to activate their phone with Callmebot:

1. Each recipient must send "I allow callmebot to send me messages" to +34 644 63 38 92 via WhatsApp
2. After sending this message, they will receive a confirmation message with their API key
3. The API key is optional for basic usage

## Integration Options

There are three ways to integrate WhatsApp messaging into your application:

### 1. Using the WhatsAppNotifier Component

The `WhatsAppNotifier` component provides a simple UI for sending messages to a single recipient:

```tsx
import { WhatsAppNotifier } from '@/components/ui/whatsapp-notifier';

function MyComponent() {
  return (
    <WhatsAppNotifier 
      defaultMessage="Hello from Shiksha!"
      onSuccess={() => console.log('Message sent successfully')}
      onError={(error) => console.error('Error sending message:', error)}
    />
  );
}
```

### 2. Using the WhatsAppBulkNotifier Component

The `WhatsAppBulkNotifier` component allows sending messages to multiple recipients:

```tsx
import { WhatsAppBulkNotifier } from '@/components/ui/whatsapp-bulk-notifier';

function MyComponent() {
  const recipients = [
    { id: '1', name: 'John Doe', phone: '919876543210' },
    { id: '2', name: 'Jane Smith', phone: '919876543211' },
  ];

  return (
    <WhatsAppBulkNotifier
      recipients={recipients}
      defaultMessage="Hello from Shiksha!"
      onSuccess={(count) => console.log(`Sent ${count} messages successfully`)}
      onError={(count) => console.error(`Failed to send ${count} messages`)}
    />
  );
}
```

### 3. Using the useWhatsAppMessaging Hook

For more control, you can use the `useWhatsAppMessaging` hook:

```tsx
import { useWhatsAppMessaging } from '@/hooks/useWhatsAppMessaging';

function MyComponent() {
  const { loading, error, lastResult, sendMessage, sendBulkMessages } = useWhatsAppMessaging({
    onSuccess: () => console.log('Message sent successfully'),
    onError: (err) => console.error('Error sending message:', err),
  });

  const handleSendMessage = async () => {
    await sendMessage({
      phone: '919876543210',
      text: 'Hello from Shiksha!',
    });
  };

  return (
    <button onClick={handleSendMessage} disabled={loading}>
      Send Message
    </button>
  );
}
```

### 4. Using the WhatsApp Service Directly

For the most flexibility, you can use the WhatsApp service directly:

```tsx
import { whatsappService } from '@/services/whatsappService';

async function sendMessage() {
  const success = await whatsappService.sendMessage({
    phone: '919876543210',
    text: 'Hello from Shiksha!',
  });

  if (success) {
    console.log('Message sent successfully');
  } else {
    console.error('Failed to send message');
  }
}
```

## Utility Functions

The `whatsapp-utils.ts` file provides utility functions for sending WhatsApp messages:

```tsx
import { sendWhatsAppMessage, sendBulkWhatsAppMessages } from '@/lib/whatsapp-utils';

// Send a single message
await sendWhatsAppMessage({
  phone: '919876543210',
  text: 'Hello from Shiksha!',
});

// Send multiple messages
const result = await sendBulkWhatsAppMessages(
  ['919876543210', '919876543211'],
  'Hello from Shiksha!',
);

console.log(`Sent: ${result.success.length}, Failed: ${result.failed.length}`);
```

## Testing

You can test the WhatsApp messaging functionality by visiting the `/whatsapp-test` route in your application. This page provides a UI for testing all three integration options.

## Limitations

- The Callmebot API is free but has limitations on the number of messages you can send
- Messages are sent from the Callmebot service, not directly from your application
- For production use with higher volumes, consider upgrading to a paid WhatsApp Business API

## Integration Ideas

Here are some ideas for integrating WhatsApp messaging into your application:

1. **Homework Notifications**: Send notifications to parents when new homework is assigned
2. **Attendance Alerts**: Notify parents when their child is marked absent
3. **Fee Reminders**: Send reminders about upcoming fee payments
4. **Event Announcements**: Notify parents about school events, holidays, etc.
5. **Emergency Alerts**: Send urgent messages to all parents in case of emergencies