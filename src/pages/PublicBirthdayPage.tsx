import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Cake,
  Gift,
  PartyPopper,
  Star,
  Heart,
  Sparkles,
  Share2,
  Home,
  Send,
  User,
  MessageCircle,
  ChevronDown,
  AlertTriangle,
  GraduationCap,
  Users,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { birthdayService, BirthdayStudent } from '@/services/birthdayService';
import { SCHOOL_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Confetti particle component
const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  
  const colors = ['#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#FF6347', '#32CD32', '#FF4500', '#1E90FF'];
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${3 + Math.random() * 2}s`,
    size: `${8 + Math.random() * 8}px`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: particle.left,
            top: '-20px',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
};

// Floating balloons component
const Balloons: React.FC = () => {
  const balloonColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
  const balloons = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    color: balloonColors[i % balloonColors.length],
    left: `${5 + i * 10}%`,
    delay: `${i * 0.5}s`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          className="absolute bottom-0 animate-balloon-float"
          style={{
            left: balloon.left,
            animationDelay: balloon.delay,
          }}
        >
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" className="drop-shadow-lg">
            <ellipse cx="20" cy="18" rx="18" ry="20" fill={balloon.color} />
            <path d="M20 38 L20 50" stroke={balloon.color} strokeWidth="1" opacity="0.7" />
            <ellipse cx="20" cy="18" rx="14" ry="16" fill="white" opacity="0.2" />
          </svg>
        </div>
      ))}
    </div>
  );
};

// Stars sparkle effect
const SparkleStars: React.FC = () => {
  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    delay: `${Math.random() * 2}s`,
    size: `${12 + Math.random() * 12}px`,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <Star
          key={star.id}
          className="absolute text-yellow-400 animate-twinkle"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

const PublicBirthdayPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<BirthdayStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageZoomed, setImageZoomed] = useState<string | null>(null);
  const [wisherName, setWisherName] = useState('');
  const [wishMessage, setWishMessage] = useState('');
  const [submittingWish, setSubmittingWish] = useState(false);
  const [showWishForm, setShowWishForm] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) {
        setError('Invalid birthday link');
        setLoading(false);
        return;
      }

      try {
        const studentData = await birthdayService.getStudentById(studentId);
        if (!studentData) {
          setError('Student not found');
          setLoading(false);
          return;
        }
        setStudent(studentData);
      } catch (err) {
        console.error('Error fetching student:', err);
        setError('Failed to load birthday card');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  useEffect(() => {
    // Stop confetti after 6 seconds
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (student) {
      document.title = `Happy Birthday ${student.studentName}! | ${SCHOOL_INFO.name}`;
    }
  }, [student]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `🎂 Wish ${student?.studentName} a Happy Birthday! From ${SCHOOL_INFO.name}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Happy Birthday ${student?.studentName}!`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Birthday link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wisherName.trim() || !wishMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmittingWish(true);
    try {
      // In a real app, this would save to the database
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Your birthday wish has been sent! 🎉');
      setWisherName('');
      setWishMessage('');
      setShowWishForm(false);
    } catch (error) {
      toast.error('Failed to send wish');
    } finally {
      setSubmittingWish(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setImageZoomed(imageUrl);
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto" />
            <Cake className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/80 text-sm font-medium">Loading birthday card...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Oops!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'This birthday link is not available.'}
            </p>
            <Link to="/">
              <Button className="gap-2">
                <Home className="w-4 h-4" />
                Go to Homepage
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Confetti active={showConfetti} />

      {/* Image Zoom Modal */}
      {imageZoomed && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setImageZoomed(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => setImageZoomed(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={imageZoomed}
            alt="Zoomed"
            className="max-w-full max-h-[90vh] object-contain animate-in zoom-in-90 duration-500 rounded-2xl shadow-2xl"
          />
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 relative overflow-hidden">
        {/* Background effects */}
        <Balloons />
        <SparkleStars />

        {/* Main content */}
        <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-white text-sm font-medium">{SCHOOL_INFO.name}</span>
            </div>

            {/* Birthday greeting */}
            <div className="flex justify-center items-center gap-3 mb-4">
              <PartyPopper className="w-10 h-10 text-yellow-300 animate-bounce" />
              <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-lg">
                Happy Birthday!
              </h1>
              <PartyPopper
                className="w-10 h-10 text-yellow-300 animate-bounce"
                style={{ animationDelay: '0.2s' }}
              />
            </div>

            {/* Emoji row */}
            <div className="flex justify-center gap-3 mb-6">
              {['🎂', '🎈', '🎁', '🎉', '🎊', '🌟', '💖'].map((emoji, i) => (
                <button
                  key={i}
                  onClick={triggerConfetti}
                  className="text-4xl sm:text-5xl animate-bounce hover:scale-125 transition-transform cursor-pointer"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Student Photo Card */}
          <div className="flex justify-center mb-8">
            <div
              className="relative cursor-pointer group"
              onClick={() => student.studentPhotoUrl && handleImageClick(student.studentPhotoUrl)}
            >
              {/* Animated ring */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full animate-spin-slow opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
              
              <Avatar className="w-44 h-44 sm:w-56 sm:h-56 ring-4 ring-white/80 relative z-10 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                <AvatarImage src={student.studentPhotoUrl || undefined} className="object-cover" />
                <AvatarFallback className="text-5xl font-bold bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                  {getInitials(student.studentName)}
                </AvatarFallback>
              </Avatar>

              {/* Age badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-4 py-2 text-lg shadow-lg animate-bounce">
                  <Cake className="w-5 h-5 mr-2" />
                  {student.age} Years Old!
                </Badge>
              </div>

              {/* Click hint */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full transition-colors z-10">
                <span className="text-white/0 group-hover:text-white/90 text-sm font-medium transition-colors">
                  Tap to enlarge
                </span>
              </div>
            </div>
          </div>

          {/* Student name and details */}
          <div className="text-center mb-8">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-lg">
              {student.studentName}
            </h2>
            <div className="flex items-center justify-center gap-2 text-white/80 text-lg">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Class {student.className} {student.classSection}
              </Badge>
            </div>
            <p className="text-white/70 mt-2">
              Born on {format(new Date(student.dateOfBirth), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Parent photos */}
          {(student.fatherPhotoUrl || student.motherPhotoUrl) && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/90 text-center flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Proud Parents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center gap-8">
                  {student.fatherPhotoUrl && (
                    <div
                      className="text-center cursor-pointer group"
                      onClick={() => handleImageClick(student.fatherPhotoUrl!)}
                    >
                      <div className="relative">
                        <Avatar className="w-24 h-24 ring-2 ring-white/40 mb-2 shadow-lg transition-all duration-300 group-hover:ring-4 group-hover:scale-110">
                          <AvatarImage src={student.fatherPhotoUrl} className="object-cover" />
                          <AvatarFallback className="bg-blue-500 text-white text-2xl">
                            {student.fatherName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="text-white font-medium">{student.fatherName}</p>
                      <p className="text-white/60 text-sm">Father</p>
                    </div>
                  )}
                  
                  {student.fatherPhotoUrl && student.motherPhotoUrl && (
                    <div className="flex items-center">
                      <Heart className="w-8 h-8 text-red-400 animate-pulse" fill="currentColor" />
                    </div>
                  )}
                  
                  {student.motherPhotoUrl && (
                    <div
                      className="text-center cursor-pointer group"
                      onClick={() => handleImageClick(student.motherPhotoUrl!)}
                    >
                      <div className="relative">
                        <Avatar className="w-24 h-24 ring-2 ring-white/40 mb-2 shadow-lg transition-all duration-300 group-hover:ring-4 group-hover:scale-110">
                          <AvatarImage src={student.motherPhotoUrl} className="object-cover" />
                          <AvatarFallback className="bg-pink-500 text-white text-2xl">
                            {student.motherName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="text-white font-medium">{student.motherName}</p>
                      <p className="text-white/60 text-sm">Mother</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* School birthday message */}
          <Card className="bg-white/15 backdrop-blur-md border-white/20 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-300" fill="currentColor" />
                    Message from {SCHOOL_INFO.name}
                  </h3>
                  <p className="text-white/90 leading-relaxed">
                    Dear {student.studentName.split(' ')[0]}, 🌟
                    <br /><br />
                    On this beautiful day, the entire {SCHOOL_INFO.name} family wishes you a 
                    very Happy {student.age}th Birthday! 🎂
                    <br /><br />
                    May this special day bring you endless joy, laughter, and wonderful surprises. 
                    As you celebrate another year of life, we hope you continue to shine bright, 
                    dream big, and achieve all your goals!
                    <br /><br />
                    Your teachers and classmates are so proud of you and excited to celebrate 
                    this milestone with you. Here's to an amazing year ahead filled with 
                    learning, growth, and beautiful memories! 🎉
                    <br /><br />
                    <span className="italic">With love and warm wishes,</span>
                    <br />
                    <span className="font-semibold">{SCHOOL_INFO.name} Family 💝</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Birthday Wish */}
          <Card className="bg-white/15 backdrop-blur-md border-white/20 mb-8">
            <CardHeader className="pb-2">
              <button
                onClick={() => setShowWishForm(!showWishForm)}
                className="flex items-center justify-between w-full"
              >
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Send Birthday Wish
                </CardTitle>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-white transition-transform',
                    showWishForm && 'rotate-180'
                  )}
                />
              </button>
            </CardHeader>
            {showWishForm && (
              <CardContent>
                <form onSubmit={handleSubmitWish} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={wisherName}
                      onChange={(e) => setWisherName(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Write your birthday wish..."
                      value={wishMessage}
                      onChange={(e) => setWishMessage(e.target.value)}
                      rows={3}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingWish}
                    className="w-full bg-white text-purple-600 hover:bg-white/90"
                  >
                    {submittingWish ? (
                      <LoadingSpinner className="w-4 h-4 mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Wish
                  </Button>
                </form>
              </CardContent>
            )}
          </Card>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={handleShare}
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 shadow-lg rounded-full px-6"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share This Card
            </Button>
            <Button
              onClick={triggerConfetti}
              size="lg"
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 rounded-full px-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Celebrate!
            </Button>
          </div>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-white/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-white/70" />
              <span className="text-white/80 font-medium">{SCHOOL_INFO.name}</span>
            </div>
            <p className="text-white/60 text-sm">{SCHOOL_INFO.address}</p>
            <p className="text-white/60 text-sm">{SCHOOL_INFO.phone}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-xs mt-4 transition-colors"
            >
              <Home className="w-3 h-3" />
              Visit School Website
            </Link>
          </footer>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes balloon-float {
          0% {
            transform: translateY(100vh) rotate(-5deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh) rotate(5deg);
            opacity: 0.8;
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
        
        .animate-balloon-float {
          animation: balloon-float 8s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </>
  );
};

export default PublicBirthdayPage;
