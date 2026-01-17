import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Cake,
  Gift,
  PartyPopper,
  Star,
  Heart,
  Sparkles,
  Share2,
  Download,
  X,
  Music,
  Volume2,
  VolumeX,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BirthdayStudent } from '@/services/birthdayService';
import { SCHOOL_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BirthdayCardProps {
  student: BirthdayStudent;
  onClose?: () => void;
  isFullPage?: boolean;
}

// Confetti particle component
const Confetti: React.FC = () => {
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
  const balloons = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    color: balloonColors[i % balloonColors.length],
    left: `${10 + i * 12}%`,
    delay: `${i * 0.3}s`,
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
          <svg
            width="40"
            height="50"
            viewBox="0 0 40 50"
            fill="none"
            className="drop-shadow-lg"
          >
            <ellipse cx="20" cy="18" rx="18" ry="20" fill={balloon.color} />
            <path
              d="M20 38 L20 50"
              stroke={balloon.color}
              strokeWidth="1"
              opacity="0.7"
            />
            <ellipse cx="20" cy="18" rx="14" ry="16" fill="white" opacity="0.2" />
          </svg>
        </div>
      ))}
    </div>
  );
};

// Stars sparkle effect
const SparkleStars: React.FC = () => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    size: `${10 + Math.random() * 15}px`,
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

export const BirthdayCard: React.FC<BirthdayCardProps> = ({
  student,
  onClose,
  isFullPage = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageZoomed, setImageZoomed] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/birthday/${student.id}`;
    const shareText = `🎂 Wish ${student.studentName} a Happy Birthday! From ${SCHOOL_INFO.name}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Happy Birthday ${student.studentName}!`,
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

  const handleDownload = () => {
    // This would ideally convert the card to an image
    toast.success('Birthday card download feature coming soon!');
  };

  const handleImageClick = (imageUrl: string) => {
    setImageZoomed(imageUrl);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      
      {/* Image Zoom Modal */}
      {imageZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
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
            className="max-w-full max-h-full object-contain animate-in zoom-in-90 duration-300 rounded-lg shadow-2xl"
          />
        </div>
      )}

      <div
        ref={cardRef}
        className={cn(
          'relative overflow-hidden',
          isFullPage
            ? 'min-h-screen'
            : 'max-w-lg mx-auto rounded-3xl shadow-2xl'
        )}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500" />
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Balloons */}
        <Balloons />
        
        {/* Sparkle Stars */}
        <SparkleStars />

        {/* Main content */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Header with school branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">FS</span>
              </div>
              <span className="text-white text-sm font-medium">{SCHOOL_INFO.name}</span>
            </div>
          </div>

          {/* Birthday greeting */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <PartyPopper className="w-8 h-8 text-yellow-300 animate-bounce" />
              <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg animate-pulse">
                Happy Birthday!
              </h1>
              <PartyPopper className="w-8 h-8 text-yellow-300 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {['🎂', '🎈', '🎁', '🎉', '🎊'].map((emoji, i) => (
                <span
                  key={i}
                  className="text-3xl animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>

          {/* Student photo with zoom effect */}
          <div className="flex justify-center mb-6">
            <div
              className="relative cursor-pointer transform transition-all duration-500 hover:scale-110"
              onClick={() => student.studentPhotoUrl && handleImageClick(student.studentPhotoUrl)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full animate-spin-slow blur-sm" style={{ padding: '4px' }} />
              <Avatar className="w-40 h-40 sm:w-48 sm:h-48 ring-4 ring-white/50 relative z-10 shadow-2xl">
                <AvatarImage
                  src={student.studentPhotoUrl || undefined}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-pink-400 to-purple-500 text-white">
                  {getInitials(student.studentName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-sm shadow-lg animate-bounce">
                🎂 {student.age} Years Old!
              </div>
            </div>
          </div>

          {/* Student name */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
              {student.studentName}
            </h2>
            <p className="text-white/80 text-lg">
              Class {student.className} {student.classSection}
            </p>
            <p className="text-white/70 text-sm mt-1">
              {format(new Date(student.dateOfBirth), 'MMMM d, yyyy')}
            </p>
          </div>

          {/* Parent photos */}
          {(student.fatherPhotoUrl || student.motherPhotoUrl) && (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Users className="w-5 h-5 text-white/80" />
                <h3 className="text-white/90 font-medium">Proud Parents</h3>
              </div>
              <div className="flex justify-center gap-6">
                {student.fatherPhotoUrl && (
                  <div
                    className="text-center cursor-pointer transform transition-all duration-300 hover:scale-110"
                    onClick={() => handleImageClick(student.fatherPhotoUrl!)}
                  >
                    <Avatar className="w-20 h-20 ring-2 ring-white/40 mb-2 shadow-lg hover:ring-4 transition-all">
                      <AvatarImage src={student.fatherPhotoUrl} className="object-cover" />
                      <AvatarFallback className="bg-blue-500 text-white text-lg">
                        {student.fatherName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white/80 text-sm font-medium">{student.fatherName}</p>
                    <p className="text-white/60 text-xs">Father</p>
                  </div>
                )}
                {student.motherPhotoUrl && (
                  <div
                    className="text-center cursor-pointer transform transition-all duration-300 hover:scale-110"
                    onClick={() => handleImageClick(student.motherPhotoUrl!)}
                  >
                    <Avatar className="w-20 h-20 ring-2 ring-white/40 mb-2 shadow-lg hover:ring-4 transition-all">
                      <AvatarImage src={student.motherPhotoUrl} className="object-cover" />
                      <AvatarFallback className="bg-pink-500 text-white text-lg">
                        {student.motherName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white/80 text-sm font-medium">{student.motherName}</p>
                    <p className="text-white/60 text-xs">Mother</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Birthday message from school */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-red-300 animate-pulse" fill="currentColor" />
              <h3 className="text-white font-semibold">From {SCHOOL_INFO.name}</h3>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              Dear {student.studentName.split(' ')[0]}, on this wonderful day, we wish you a birthday 
              filled with joy, laughter, and all the things that make you happy! 🎉 
              May this new year of your life bring you amazing adventures and beautiful memories. 
              Your teachers and friends at {SCHOOL_INFO.name} are so proud of you! 
              Have the most fantastic birthday! 🌟
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={handleShare}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 rounded-full px-6"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Wishes
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 rounded-full px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Close button if in modal */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-white/20">
            <p className="text-white/60 text-xs">
              {SCHOOL_INFO.address}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {SCHOOL_INFO.phone}
            </p>
          </div>
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

export default BirthdayCard;
