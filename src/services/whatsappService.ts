import axios from 'axios';

// String Constants
const ERROR_MESSAGES = {
  SEND_MESSAGE: 'Error sending WhatsApp message:',
  INVALID_PHONE: 'Invalid phone number format',
  MISSING_PARAMETERS: 'Missing required parameters'
};

// Callmebot API endpoint
const CALLMEBOT_API_URL = 'https://api.callmebot.com/whatsapp.php';

export interface WhatsAppMessage {
  phone: string;      // Phone number with country code but without '+' or '00' (e.g., '919876543210')
  text: string;       // Message text
  apiKey?: string;    // Optional API key if you have one
}

class WhatsAppService {
  /**
   * Sends a WhatsApp message using the Callmebot API
   * Note: First-time users need to activate their phone with Callmebot
   * by sending "I allow callmebot to send me messages" to +34 644 63 38 92
   * 
   * @param message The WhatsApp message to send
   * @returns Promise<boolean> indicating success or failure
   */
  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      // Validate required parameters
      if (!message.phone || !message.text) {
        console.error(ERROR_MESSAGES.MISSING_PARAMETERS);
        return false;
      }

      // Validate phone number format (should be numbers only)
      if (!/^\d+$/.test(message.phone)) {
        console.error(ERROR_MESSAGES.INVALID_PHONE);
        return false;
      }

      // Prepare request parameters
      const params = new URLSearchParams({
        phone: message.phone,
        text: message.text,
        apikey: message.apiKey || '' // API key is optional
      });

      // Send the request to Callmebot API
      const response = await axios.get(`${CALLMEBOT_API_URL}?${params.toString()}`);

      // Check if the request was successful
      if (response.status === 200) {
        return true;
      } else {
        console.error(ERROR_MESSAGES.SEND_MESSAGE, response.data);
        return false;
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.SEND_MESSAGE, error);
      return false;
    }
  }

  /**
   * Sends a WhatsApp message to multiple recipients
   * 
   * @param phones Array of phone numbers
   * @param text Message text
   * @param apiKey Optional API key
   * @returns Promise<{success: string[], failed: string[]}> Lists of successful and failed recipients
   */
  async sendBulkMessage(
    phones: string[],
    text: string,
    apiKey?: string
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = {
      success: [] as string[],
      failed: [] as string[]
    };

    // Process each phone number sequentially to avoid rate limiting
    for (const phone of phones) {
      const success = await this.sendMessage({
        phone,
        text,
        apiKey
      });

      if (success) {
        results.success.push(phone);
      } else {
        results.failed.push(phone);
      }

      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

export const whatsappService = new WhatsAppService();