import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SCHOOL_INFO } from '@/lib/constants';
import { UserPlus, FileText } from 'lucide-react';

export function maskValue(value: string | null | undefined, visibleChars = 3): string {
  if (!value) return '••••';
  if (value.length <= visibleChars) return '•'.repeat(value.length);
  return value.slice(0, visibleChars) + '•'.repeat(Math.max(0, value.length - visibleChars));
}

export function maskMobile(mobile: string | null | undefined): string {
  if (!mobile) return '••••••••••';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length <= 4) return '•'.repeat(clean.length);
  return '•'.repeat(clean.length - 4) + clean.slice(-4);
}

export function maskAddress(address: string | null | undefined): string {
  if (!address) return '••••••••';
  const words = address.split(' ');
  if (words.length <= 2) return maskValue(address, 3);
  return words.slice(0, 2).join(' ') + ' ••••';
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not available';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Not available';
  }
}

const PublicIDCardLookup: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `${SCHOOL_INFO.name} - ID Card Portal`;
  }, []);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen text-gray-900" data-theme="light">
      <div className="container mx-auto px-3 sm:px-4 py-6 max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={SCHOOL_INFO.logo}
            alt={SCHOOL_INFO.name}
            className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-blue-200"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900">{SCHOOL_INFO.name}</h1>
          <p className="text-sm text-gray-600">Student ID Card Portal</p>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800 text-center">
              Please fill the ID card form with your child's <strong>latest details</strong> — including updated class, address, and photos.
            </p>
          </CardContent>
        </Card>

        {/* Fill Form — for all parents */}
        <Card className="border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" />
              Student ID Card Form
            </CardTitle>
            <CardDescription className="text-xs">
              Whether your child is <strong>new</strong> or <strong>already enrolled</strong>, please fill this form with the latest details. Our team will take care of the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full gap-2"
              onClick={() => navigate('/id-card/new')}
            >
              <UserPlus className="h-4 w-4" />
              Fill ID Card Form
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4 space-y-1">
          <p>{SCHOOL_INFO.name} &middot; {SCHOOL_INFO.address}</p>
          <p>
            <a href={`tel:${SCHOOL_INFO.phone.split(',')[0].trim()}`} className="underline">
              {SCHOOL_INFO.phone}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicIDCardLookup;
