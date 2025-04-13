import { whatsappService, WhatsAppMessage } from '@/services/whatsappService';
import { toast } from 'react-hot-toast';

/**
 * Formats a phone number by removing any non-digit characters
 * @param phone Phone number to format
 * @returns Formatted phone number containing only digits
 */
export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

/**
 * Validates if a phone number is in the correct format for WhatsApp
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const formattedPhone = formatPhoneNumber(phone);
  // Phone should be at least 10 digits (some country codes are 1-3 digits)
  return formattedPhone.length >= 10 && /^\d+$/.test(formattedPhone);
};

/**
 * Sends a WhatsApp message with error handling and notifications
 * @param message WhatsApp message object
 * @param showToast Whether to show toast notifications
 * @returns Promise<boolean> indicating success or failure
 */
export const sendWhatsAppMessage = async (
  message: WhatsAppMessage,
  showToast = true
): Promise<boolean> => {
  try {
    // Format the phone number
    const formattedMessage = {
      ...message,
      phone: formatPhoneNumber(message.phone)
    };

    // Validate phone number
    if (!isValidPhoneNumber(formattedMessage.phone)) {
      if (showToast) {
        toast.error('Invalid phone number format');
      }
      return false;
    }

    // Send the message
    const success = await whatsappService.sendMessage(formattedMessage);

    // Show toast notification based on result
    if (showToast) {
      if (success) {
        toast.success('WhatsApp message sent successfully');
      } else {
        toast.error('Failed to send WhatsApp message');
      }
    }

    return success;
  } catch (error) {
    if (showToast) {
      toast.error('Error sending WhatsApp message');
    }
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

/**
 * Sends a WhatsApp message to multiple recipients
 * @param phones Array of phone numbers
 * @param text Message text
 * @param apiKey Optional API key
 * @param showToast Whether to show toast notifications
 * @returns Promise with lists of successful and failed recipients
 */
export const sendBulkWhatsAppMessages = async (
  phones: string[],
  text: string,
  apiKey?: string,
  showToast = true
): Promise<{ success: string[]; failed: string[] }> => {
  try {
    // Format and validate phone numbers
    const validPhones = phones
      .map(formatPhoneNumber)
      .filter(isValidPhoneNumber);

    if (validPhones.length === 0) {
      if (showToast) {
        toast.error('No valid phone numbers provided');
      }
      return { success: [], failed: phones };
    }

    // Send messages
    const result = await whatsappService.sendBulkMessage(validPhones, text, apiKey);

    // Show toast notification
    if (showToast) {
      if (result.success.length > 0) {
        toast.success(`Sent ${result.success.length} WhatsApp message(s) successfully`);
      }
      
      if (result.failed.length > 0) {
        toast.error(`Failed to send ${result.failed.length} WhatsApp message(s)`);
      }
    }

    return result;
  } catch (error) {
    if (showToast) {
      toast.error('Error sending bulk WhatsApp messages');
    }
    console.error('Error sending bulk WhatsApp messages:', error);
    return { success: [], failed: phones };
  }
};