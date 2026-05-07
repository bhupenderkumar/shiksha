import React, { useState } from 'react';
import {
  Send,
  CheckCircle,
  MessageSquare,
  Mic,
  ArrowLeft,
  Search,
  Copy,
  Clock,
  Reply as ReplyIcon,
  AlertCircle,
  Sparkles,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import {
  schoolFeedbackService,
  type SchoolFeedback as SchoolFeedbackRecord,
} from '@/services/schoolFeedbackService';
import { toast } from 'react-hot-toast';
import { SCHOOL_INFO } from '@/lib/constants';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: 'COMPLAINT', label: 'शिकायत / Concern', emoji: '🙏' },
  { value: 'SUGGESTION', label: 'सुझाव / Suggestion', emoji: '💡' },
  { value: 'APPRECIATION', label: 'सराहना / Appreciation', emoji: '🌟' },
  { value: 'OTHER', label: 'अन्य / Other', emoji: '💬' },
];

// Friendly mood selector — replaces a 1-5 star bar so it
// never "feels negative" to a parent. The numeric value (1–5)
// is still stored in the existing rating column.
const MOODS: { value: number; emoji: string; label: string }[] = [
  { value: 1, emoji: '😕', label: 'ठीक नहीं / Could be better' },
  { value: 2, emoji: '🙂', label: 'ठीक है / Okay' },
  { value: 3, emoji: '😊', label: 'अच्छा / Good' },
  { value: 4, emoji: '😄', label: 'बहुत अच्छा / Very good' },
  { value: 5, emoji: '🤩', label: 'शानदार / Excellent' },
];

// School WhatsApp number — digits only, with country code (no '+').
// Pulled from SCHOOL_INFO.phone (first number).
const SCHOOL_WHATSAPP_NUMBER = '919311872001';

interface SubmissionDetails {
  ticket_code: string;
  category?: string;
  rating?: number;
  message?: string;
  parent_name?: string;
  phone?: string;
  has_voice: boolean;
}

function buildWhatsAppMessage(d: SubmissionDetails): string {
  const lines: string[] = [];
  lines.push(`*New Parent Feedback - ${SCHOOL_INFO?.name || 'School'}*`);
  lines.push(`Tracking Code: ${d.ticket_code}`);
  if (d.category) {
    const cat = CATEGORIES.find((c) => c.value === d.category);
    lines.push(`Category: ${cat ? cat.label : d.category}`);
  }
  if (d.rating) lines.push(`Rating: ${d.rating}/5`);
  if (d.parent_name) lines.push(`Name: ${d.parent_name}`);
  if (d.phone) lines.push(`Phone: ${d.phone}`);
  if (d.message) {
    lines.push('');
    lines.push('Message:');
    lines.push(d.message);
  }
  if (d.has_voice) {
    lines.push('');
    lines.push('(Voice note attached on portal)');
  }
  lines.push('');
  lines.push(
    `Track status: ${typeof window !== 'undefined' ? window.location.origin : ''}/school-feedback?check=1&code=${d.ticket_code}`
  );
  return lines.join('\n');
}

function openWhatsApp(d: SubmissionDetails): void {
  const text = encodeURIComponent(buildWhatsAppMessage(d));
  const url = `https://wa.me/${SCHOOL_WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

const SchoolFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('check') ? 'check' : 'submit';
  const initialCode = searchParams.get('code') || '';

  const [mode, setMode] = useState<'submit' | 'check'>(initialMode);

  // Submit state
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<string>('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [submittedDetails, setSubmittedDetails] = useState<SubmissionDetails | null>(null);

  // Check-status state
  const [lookupCode, setLookupCode] = useState<string>(initialCode);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<SchoolFeedbackRecord | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const handleSubmit = async () => {
    // At least one of: rating, message, or voice must be provided
    if (!rating && !message.trim() && !voiceBlob) {
      toast.error('कृपया कुछ फीडबैक दें / Please provide some feedback');
      return;
    }

    try {
      setSubmitting(true);
      const result = await schoolFeedbackService.submitFeedback({
        parent_name: parentName.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        voice_blob: voiceBlob || undefined,
        rating: rating || undefined,
        category: category || undefined,
      });
      const code = result.ticket_code || null;
      const details: SubmissionDetails | null = code
        ? {
            ticket_code: code,
            category: category || undefined,
            rating: rating || undefined,
            message: message.trim() || undefined,
            parent_name: parentName.trim() || undefined,
            phone: phone.trim() || undefined,
            has_voice: !!voiceBlob,
          }
        : null;
      setSubmittedCode(code);
      setSubmittedDetails(details);
      toast.success('धन्यवाद! / Thank you!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('कुछ गलत हो गया / Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setCategory('');
    setParentName('');
    setPhone('');
    setMessage('');
    setVoiceBlob(null);
    setSubmittedCode(null);
    setSubmittedDetails(null);
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const handleLookup = async () => {
    const code = lookupCode.trim().toUpperCase();
    if (!code) {
      setLookupError('कृपया कोड दर्ज करें / Please enter a code');
      return;
    }
    try {
      setLookupLoading(true);
      setLookupError(null);
      setLookupResult(null);
      const result = await schoolFeedbackService.getByTicketCode(code);
      if (!result) {
        setLookupError('इस कोड के लिए कोई फीडबैक नहीं मिला / No feedback found for this code');
        return;
      }
      setLookupResult(result);
      setSearchParams({ check: '1', code });
    } catch (err) {
      console.error('Lookup error:', err);
      setLookupError('कुछ गलत हो गया / Something went wrong');
    } finally {
      setLookupLoading(false);
    }
  };

  // Success screen — shows ticket code so parent can check status later
  if (submittedCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            धन्यवाद! 🙏
          </h2>
          <p className="text-lg text-green-600 mb-1">Thank You!</p>
          <p className="text-gray-500 mb-6">
            आपकी राय दर्ज हो गई है
            <br />
            <span className="text-sm">Your feedback has been recorded</span>
          </p>

          {/* Ticket code card */}
          <div className="bg-white border-2 border-dashed border-green-300 rounded-2xl p-5 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1 text-center">
              आपका ट्रैकिंग कोड / Your tracking code
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-2xl font-mono font-bold tracking-wider text-green-700">
                {submittedCode}
              </span>
              <button
                onClick={() => handleCopyCode(submittedCode)}
                className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                aria-label="Copy code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              इस कोड को सुरक्षित रखें। बाद में यहीं आकर "Check Status" पर
              क्लिक करके स्कूल का जवाब देख सकते हैं।
              <br />
              <span className="block mt-1">
                Save this code. Come back later and tap "Check Status" to see
                the school's reply.
              </span>
            </p>
          </div>

          <button
            onClick={() => {
              const code = submittedCode;
              resetForm();
              setMode('check');
              setLookupCode(code);
              setLookupResult(null);
              setLookupError(null);
            }}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-lg font-semibold active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Check Status
          </button>
          {submittedDetails && (
            <button
              onClick={() => openWhatsApp(submittedDetails)}
              className="mt-3 w-full py-4 rounded-2xl text-white text-base font-semibold active:scale-95 transition-all flex items-center justify-center gap-2 shadow"
              style={{ backgroundColor: '#25D366' }}
            >
              {/* WhatsApp glyph */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l.241.379-1.001 3.658 3.749-.996zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.174.198-.298.297-.496.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01a1.1 1.1 0 0 0-.793.372c-.272.297-1.04 1.016-1.04 2.479s1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
              </svg>
              WhatsApp School / स्कूल को भेजें
            </button>
          )}
          <button
            onClick={resetForm}
            className="mt-3 w-full py-3 text-gray-600 hover:text-gray-800 text-sm border border-gray-200 rounded-2xl"
          >
            और फीडबैक दें / Give More Feedback
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full py-3 text-gray-400 hover:text-gray-600 text-sm"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            होम पेज / Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-blue-50/40 to-white">
      <SEO
        title="Parent Feedback – Share Your Experience"
        description="Share your feedback as a parent of First Step Pre School & Primary School, Saurabh Vihar, Badarpur, Delhi. Help us improve and guide other parents looking for the best play school in the area."
        path="/school-feedback"
      />
      {/* Sticky app-shell header */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md">
        <div className="max-w-md mx-auto px-3 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 py-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-2 -ml-1 rounded-full hover:bg-white/10 active:bg-white/20"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold leading-tight truncate">
                {SCHOOL_INFO?.name || 'School'}
              </h1>
              <p className="text-[11px] text-violet-100/90 leading-tight">
                आपकी आवाज — Share Your Voice
              </p>
            </div>
            <Heart className="w-5 h-5 opacity-80" />
          </div>

          {/* Segmented control tabs */}
          <div className="bg-white/15 backdrop-blur rounded-full p-1 flex mb-3">
            <button
              type="button"
              onClick={() => {
                setMode('submit');
                setSearchParams({});
              }}
              className={cn(
                'flex-1 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                mode === 'submit'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-white/90 hover:text-white'
              )}
            >
              <Send className="w-3.5 h-3.5" />
              भेजें / Submit
            </button>
            <button
              type="button"
              onClick={() => setMode('check')}
              className={cn(
                'flex-1 py-2 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all',
                mode === 'check'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-white/90 hover:text-white'
              )}
            >
              <Search className="w-3.5 h-3.5" />
              स्थिति / Status
            </button>
          </div>
        </div>
      </div>

      {mode === 'check' ? (
        <CheckStatusPanel
          code={lookupCode}
          setCode={setLookupCode}
          loading={lookupLoading}
          error={lookupError}
          result={lookupResult}
          onLookup={handleLookup}
          onBackHome={() => navigate('/')}
        />
      ) : (
      <div className="max-w-md mx-auto px-4 pt-4 pb-32 space-y-4">
        {/* Friendly intro card */}
        <div className="bg-gradient-to-br from-white to-violet-50/40 rounded-3xl p-4 shadow-sm border border-violet-100">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                हमें आपकी राय चाहिए
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                We’d love to hear from you. Every voice helps us grow.
              </p>
            </div>
          </div>
        </div>
        {/* Category */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-800 font-semibold mb-1">
            किस बारे में है?
          </p>
          <p className="text-xs text-gray-400 mb-3">
            What is this about? <span className="text-gray-300">(optional)</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(category === c.value ? '' : c.value)}
                className={cn(
                  'py-3 px-3 rounded-2xl border text-sm font-medium flex items-center gap-2 transition-all active:scale-95',
                  category === c.value
                    ? 'bg-violet-50 border-violet-400 text-violet-700 ring-2 ring-violet-200'
                    : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="text-xs leading-tight text-left">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood selector — replaces stars with friendly emojis */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-center text-gray-800 font-semibold mb-1">
            स्कूल कैसा लगा?
          </p>
          <p className="text-center text-xs text-gray-400 mb-4">
            How was your experience?
          </p>
          <div className="flex justify-between gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setRating(rating === m.value ? 0 : m.value)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border transition-all active:scale-95',
                  rating === m.value
                    ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-200'
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                )}
                aria-label={m.label}
              >
                <span className={cn('text-3xl transition-transform', rating === m.value && 'scale-110')}>
                  {m.emoji}
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-3 text-sm text-violet-700 font-medium">
              {MOODS.find((m) => m.value === rating)?.label}
            </p>
          )}
        </div>

        {/* Voice Recording - PRIMARY action for illiterate parents */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Mic className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold leading-tight">आवाज में बताएं</p>
              <p className="text-xs text-gray-400">Record your voice (up to 2 min)</p>
            </div>
          </div>
          <div className="mt-3">
            <VoiceRecorder
              onRecordingComplete={(blob) => setVoiceBlob(blob)}
              onRecordingDelete={() => setVoiceBlob(null)}
              maxDurationSeconds={120}
            />
          </div>
        </div>

        {/* Optional Text Message */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold leading-tight">लिखकर बताएं</p>
              <p className="text-xs text-gray-400">Type your message (optional)</p>
            </div>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="यहाँ लिखें... / Type here..."
            rows={3}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 focus:bg-white"
          />
        </div>

        {/* Name & Phone (Optional) */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <p className="text-gray-800 font-semibold mb-1">आपका नाम और फोन</p>
          <p className="text-xs text-gray-400 mb-3">
            Your name & phone <span className="text-gray-300">(optional)</span>
          </p>
          <div className="space-y-2.5">
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="👤 नाम / Name"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 focus:bg-white"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="📱 फोन नंबर / Phone"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 focus:bg-white"
            />
          </div>
        </div>
      </div>
      )}

      {/* Sticky bottom action bar (only on submit mode) */}
      {mode === 'submit' && !submittedCode && (
        <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-md mx-auto px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-2 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur border border-gray-100 shadow-lg rounded-3xl p-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || (!rating && !message.trim() && !voiceBlob)}
                className={cn(
                  'w-full py-4 rounded-2xl text-white text-base font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all',
                  submitting || (!rating && !message.trim() && !voiceBlob)
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-200'
                )}
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    भेज रहे हैं...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    भेजें / Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CheckStatusPanelProps {
  code: string;
  setCode: (v: string) => void;
  loading: boolean;
  error: string | null;
  result: SchoolFeedbackRecord | null;
  onLookup: () => void;
  onBackHome: () => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  NEW: {
    label: 'पहुँच गया / Received',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  REVIEWED: {
    label: 'पढ़ लिया / Reviewed',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  REPLIED: {
    label: 'जवाब आ गया / Replied',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <ReplyIcon className="w-3.5 h-3.5" />,
  },
};

const CheckStatusPanel: React.FC<CheckStatusPanelProps> = ({
  code,
  setCode,
  loading,
  error,
  result,
  onLookup,
  onBackHome,
}) => {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <p className="text-center text-gray-700 font-medium mb-1">
          अपना ट्रैकिंग कोड दर्ज करें
        </p>
        <p className="text-center text-xs text-gray-400 mb-4">
          Enter your tracking code (e.g. FSPS-AB12CD)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="FSPS-XXXXXX"
            className="flex-1 border rounded-xl px-4 py-3 text-base font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter') onLookup();
            }}
          />
          <button
            onClick={onLookup}
            disabled={loading}
            className="px-5 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">खोजें</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Status header */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">
                Code:{' '}
                <span className="font-mono font-semibold text-gray-700">
                  {result.ticket_code}
                </span>
              </span>
              {(() => {
                const s = STATUS_LABELS[result.status] || STATUS_LABELS.NEW;
                return (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border',
                      s.color
                    )}
                  >
                    {s.icon}
                    {s.label}
                  </span>
                );
              })()}
            </div>
            <div className="text-xs text-gray-400">
              Submitted: {new Date(result.created_at).toLocaleString()}
            </div>
            {result.category && (
              <div className="mt-2 text-xs text-gray-600">
                <span className="text-gray-400">Category: </span>
                {result.category}
              </div>
            )}
          </div>

          {/* Original feedback */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
              आपकी बात / Your message
            </p>
            {result.rating ? (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">
                  {MOODS.find((m) => m.value === result.rating)?.emoji || '😊'}
                </span>
                <span className="text-sm text-gray-600">
                  {MOODS.find((m) => m.value === result.rating)?.label}
                </span>
              </div>
            ) : null}
            {result.message ? (
              <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                {result.message}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                (no text message)
              </p>
            )}
            {result.voice_url && (
              <audio
                controls
                src={result.voice_url}
                className="w-full mt-3"
              />
            )}
          </div>

          {/* Reply from school */}
          <div
            className={cn(
              'rounded-2xl p-5 shadow-sm border',
              result.admin_reply
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            )}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-1">
              <ReplyIcon className="w-3.5 h-3.5" />
              स्कूल का जवाब / School's reply
            </p>
            {result.admin_reply ? (
              <>
                <p className="text-gray-800 text-sm whitespace-pre-wrap">
                  {result.admin_reply}
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  {result.replied_by ? `— ${result.replied_by}` : '— School'}
                  {result.replied_at &&
                    ` · ${new Date(result.replied_at).toLocaleString()}`}
                </p>
              </>
            ) : (
              <p className="text-sm text-yellow-800">
                अभी जवाब नहीं आया है। कृपया बाद में दोबारा देखें।
                <br />
                <span className="text-xs">
                  No reply yet. Please check back later.
                </span>
              </p>
            )}
          </div>
        </>
      )}

      <div className="text-center pb-6">
        <button
          onClick={onBackHome}
          className="text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          वापस जाएं / Go Back
        </button>
      </div>
    </div>
  );
};

export default SchoolFeedback;
