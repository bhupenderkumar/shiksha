import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithAssistant } from '@/services/groqService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SCHOOL_INFO } from '@/lib/constants';
import { Mic, MicOff, Send, Volume2, VolumeX, MessageCircle, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const VoiceAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    document.title = `${SCHOOL_INFO.name} - Voice Assistant`;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Support Hindi + English

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto-send after voice input
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error('Could not hear you. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Detect language — simple heuristic
    const hasHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = hasHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const response = await chatWithAssistant(messageText, history);
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      speakText(response);
    } catch {
      toast.error('Could not get a response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, speakText]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen text-gray-900" data-theme="light">
      <div className="container mx-auto px-3 sm:px-4 py-4 max-w-lg h-screen flex flex-col">
        {/* Header */}
        <div className="text-center space-y-1 pb-3 border-b">
          <img
            src={SCHOOL_INFO.logo}
            alt={SCHOOL_INFO.name}
            className="w-12 h-12 mx-auto rounded-full object-cover border-2 border-blue-200"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-lg font-bold text-blue-900">{SCHOOL_INFO.name}</h1>
          <p className="text-xs text-gray-500">Voice Assistant — Ask anything about our school</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Welcome! How can I help you?</p>
                <p className="text-xs text-gray-500 mt-1">Ask about admissions, fees, timings, or anything else</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center px-4">
                {['What are the school timings?', 'How to get admission?', 'What classes do you have?', 'Fee structure'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-white border border-blue-200 rounded-full text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t pt-3 pb-4 space-y-2">
          {/* Voice status */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-xs animate-pulse">
              <Mic className="w-4 h-4" />
              Listening... Speak now
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-xs">
              <Volume2 className="w-4 h-4" />
              Speaking...
              <button onClick={stopSpeaking} className="text-red-500 underline">Stop</button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            {/* TTS toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </Button>

            {/* Text input */}
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type or tap mic to speak..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />

            {/* Mic button */}
            <Button
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={toggleListening}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Send button */}
            <Button
              size="icon"
              className="h-10 w-10 flex-shrink-0"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick contact */}
          <div className="flex justify-center">
            <a
              href={`tel:${SCHOOL_INFO.phone.split(',')[0].trim()}`}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
            >
              <Phone className="w-3 h-3" />
              Prefer calling? {SCHOOL_INFO.phone.split(',')[0].trim()}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
