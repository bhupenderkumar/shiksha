import { useState } from 'react';
import { WhatsAppMessage } from '@/services/whatsappService';
import { sendWhatsAppMessage, sendBulkWhatsAppMessages } from '@/lib/whatsapp-utils';

interface UseWhatsAppMessagingOptions {
  onSuccess?: (count?: number) => void;
  onError?: (error: string | number) => void;
  showToasts?: boolean;
}

interface WhatsAppMessagingState {
  loading: boolean;
  error: string | null;
  lastResult: {
    success: boolean;
    successCount?: number;
    failedCount?: number;
  } | null;
}

/**
 * Custom hook for sending WhatsApp messages
 * 
 * @param options Configuration options
 * @returns Object with state and methods for sending WhatsApp messages
 */
export function useWhatsAppMessaging(options: UseWhatsAppMessagingOptions = {}) {
  const { onSuccess, onError, showToasts = true } = options;
  
  const [state, setState] = useState<WhatsAppMessagingState>({
    loading: false,
    error: null,
    lastResult: null,
  });

  /**
   * Send a WhatsApp message to a single recipient
   * 
   * @param message WhatsApp message object
   * @returns Promise<boolean> indicating success or failure
   */
  const sendMessage = async (message: WhatsAppMessage): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const success = await sendWhatsAppMessage(message, showToasts);
      
      setState(prev => ({
        ...prev,
        loading: false,
        lastResult: { success },
      }));
      
      if (success) {
        onSuccess?.();
      } else {
        const errorMsg = 'Failed to send WhatsApp message';
        setState(prev => ({ ...prev, error: errorMsg }));
        onError?.(errorMsg);
      }
      
      return success;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
        lastResult: { success: false },
      }));
      
      onError?.(errorMsg);
      return false;
    }
  };

  /**
   * Send WhatsApp messages to multiple recipients
   * 
   * @param phones Array of phone numbers
   * @param text Message text
   * @param apiKey Optional API key
   * @returns Promise with lists of successful and failed recipients
   */
  const sendBulkMessages = async (
    phones: string[],
    text: string,
    apiKey?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await sendBulkWhatsAppMessages(phones, text, apiKey, showToasts);
      
      setState(prev => ({
        ...prev,
        loading: false,
        lastResult: {
          success: result.success.length > 0,
          successCount: result.success.length,
          failedCount: result.failed.length,
        },
      }));
      
      if (result.success.length > 0) {
        onSuccess?.(result.success.length);
      }
      
      if (result.failed.length > 0) {
        onError?.(result.failed.length);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
        lastResult: { success: false, successCount: 0, failedCount: phones.length },
      }));
      
      onError?.(errorMsg);
      return { success: [], failed: phones };
    }
  };

  return {
    ...state,
    sendMessage,
    sendBulkMessages,
  };
}