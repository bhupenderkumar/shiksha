import React, { useState } from 'react';
import { Star, Send, CheckCircle, MessageSquare, Mic, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { schoolFeedbackService } from '@/services/schoolFeedbackService';
import { toast } from 'react-hot-toast';
import { SCHOOL_INFO } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

const SchoolFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // At least one of: rating, message, or voice must be provided
    if (!rating && !message.trim() && !voiceBlob) {
      toast.error('कृपया कुछ फीडबैक दें / Please provide some feedback');
      return;
    }

    try {
      setSubmitting(true);
      await schoolFeedbackService.submitFeedback({
        parent_name: parentName.trim() || undefined,
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        voice_blob: voiceBlob || undefined,
        rating: rating || undefined,
      });
      setSubmitted(true);
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
    setParentName('');
    setPhone('');
    setMessage('');
    setVoiceBlob(null);
    setSubmitted(false);
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            धन्यवाद! 🙏
          </h2>
          <p className="text-lg text-green-600 mb-1">Thank You!</p>
          <p className="text-gray-500 mb-8">
            आपकी राय हमारे लिए बहुत महत्वपूर्ण है
            <br />
            <span className="text-sm">Your feedback is very important to us</span>
          </p>
          <button
            onClick={resetForm}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-lg font-semibold active:scale-95 transition-all"
          >
            और फीडबैक दें / Give More Feedback
          </button>
          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full py-3 text-gray-500 hover:text-gray-700 text-sm"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            होम पेज / Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-6 text-center">
        <h1 className="text-xl font-bold">{SCHOOL_INFO?.name || 'School'}</h1>
        <p className="text-violet-100 text-sm mt-1">
          अपनी राय दें / Share Your Feedback
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Star Rating - BIG and tappable */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-center text-gray-700 font-medium mb-1">
            स्कूल को कितने ⭐ देंगे?
          </p>
          <p className="text-center text-xs text-gray-400 mb-4">
            How would you rate our school?
          </p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="active:scale-110 transition-transform p-1"
              >
                <Star
                  className={cn(
                    'w-12 h-12 transition-colors',
                    star <= rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-2 text-sm">
              {rating <= 2 && '😟'}
              {rating === 3 && '😐'}
              {rating >= 4 && '😊'}
              {' '}
              {rating <= 2 && 'हम और बेहतर करेंगे'}
              {rating === 3 && 'ठीक है, सुधार करेंगे'}
              {rating >= 4 && 'बहुत अच्छा! शुक्रिया'}
            </p>
          )}
        </div>

        {/* Voice Recording - PRIMARY action for illiterate parents */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Mic className="w-5 h-5 text-blue-500" />
            <p className="text-gray-700 font-medium">
              आवाज में बताएं
            </p>
          </div>
          <p className="text-center text-xs text-gray-400 mb-4">
            Record your voice message
          </p>
          <VoiceRecorder
            onRecordingComplete={(blob) => setVoiceBlob(blob)}
            onRecordingDelete={() => setVoiceBlob(null)}
            maxDurationSeconds={120}
          />
        </div>

        {/* Optional Text Message */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <p className="text-gray-700 font-medium">
              लिखकर बताएं
            </p>
          </div>
          <p className="text-center text-xs text-gray-400 mb-3">
            Type your message (optional)
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="यहाँ लिखें... / Type here..."
            rows={3}
            className="w-full border rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          />
        </div>

        {/* Name & Phone (Optional) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-center text-gray-700 font-medium mb-1">
            आपका नाम और फोन
          </p>
          <p className="text-center text-xs text-gray-400 mb-4">
            Your name & phone (optional)
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="👤 नाम / Name"
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="📱 फोन नंबर / Phone"
              className="w-full border rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>
        </div>

        {/* Submit Button - BIG */}
        <button
          onClick={handleSubmit}
          disabled={submitting || (!rating && !message.trim() && !voiceBlob)}
          className={cn(
            'w-full py-5 rounded-2xl text-white text-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg',
            submitting || (!rating && !message.trim() && !voiceBlob)
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-violet-200'
          )}
        >
          {submitting ? (
            <>
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              भेज रहे हैं...
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              भेजें / Submit
            </>
          )}
        </button>

        {/* Back to home */}
        <div className="text-center pb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            वापस जाएं / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchoolFeedback;
