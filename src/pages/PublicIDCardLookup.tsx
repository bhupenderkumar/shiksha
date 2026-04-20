import React, { useState, useEffect } from 'react';
import { idCardService } from '@/services/idCardService';
import { IDCardData } from '@/types/idCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SCHOOL_INFO } from '@/lib/constants';
import { Search, MessageCircle, Phone, User, MapPin, Calendar, BookOpen, ShieldCheck, Plus } from 'lucide-react';

const WHATSAPP_NUMBER = '919311872001';

function maskValue(value: string | null | undefined, visibleChars = 3): string {
  if (!value) return '••••';
  if (value.length <= visibleChars) return '•'.repeat(value.length);
  return value.slice(0, visibleChars) + '•'.repeat(Math.max(0, value.length - visibleChars));
}

function maskMobile(mobile: string | null | undefined): string {
  if (!mobile) return '••••••••••';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length <= 4) return '•'.repeat(clean.length);
  return '•'.repeat(clean.length - 4) + clean.slice(-4);
}

function maskAddress(address: string | null | undefined): string {
  if (!address) return '••••••••';
  const words = address.split(' ');
  if (words.length <= 2) return maskValue(address, 3);
  return words.slice(0, 2).join(' ') + ' ••••';
}

function formatDate(dateStr: string | null | undefined): string {
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
  const [mobile, setMobile] = useState('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IDCardData[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${SCHOOL_INFO.name} - ID Card Lookup`;
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (studentName.trim().length < 2) {
      setError('Please enter at least 2 characters of the student\'s first name');
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const data = await idCardService.lookupByMobileAndName(cleanMobile, studentName.trim());
      setResults(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (studentNameVal: string, field: string) => {
    const message = `Hi, I would like to update the *${field}* for student *${studentNameVal}*. My registered mobile number is ${mobile}.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openWhatsAppNewStudent = () => {
    const message = `Hi, I am a new parent and would like to create an ID card for my child. Please share the link or guide me.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen text-gray-900" data-theme="light">
      <div className="container mx-auto px-3 sm:px-4 py-6 max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={SCHOOL_INFO.logo}
            alt={SCHOOL_INFO.name}
            className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-blue-200"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900">{SCHOOL_INFO.name}</h1>
          <p className="text-sm text-gray-600">Student ID Card - Lookup &amp; Update Portal</p>
        </div>

        {/* Search Form */}
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Find Your ID Card
            </CardTitle>
            <CardDescription>
              Enter your registered mobile number and student's first name to look up the ID card details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Registered Mobile Number
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  maxLength={13}
                  className="text-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <User className="inline h-4 w-4 mr-1" />
                  Student's First Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="text-lg"
                  required
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && !loading && results !== null && (
          <>
            {results.length === 0 ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-6 text-center space-y-4">
                  <p className="text-amber-800 font-medium">No ID card found with the given details.</p>
                  <p className="text-sm text-gray-600">
                    If you're a new parent, you can create an ID card or contact us for help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="default"
                      onClick={() => window.location.href = '/id-card/new'}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create New ID Card
                    </Button>
                    <Button
                      variant="outline"
                      onClick={openWhatsAppNewStudent}
                      className="gap-2 border-green-500 text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message on WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              results.map((card) => (
                <Card key={card.id} className="border-green-200 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5" />
                          ID Card Found
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          For security, some details are partially hidden. Contact us to update.
                        </CardDescription>
                      </div>
                      {typeof card.studentPhoto === 'string' && card.studentPhoto && (
                        <img
                          src={card.studentPhoto}
                          alt="Student"
                          className="w-14 h-14 rounded-full object-cover border-2 border-green-200"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Student Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoRow
                        icon={<User className="h-4 w-4 text-blue-600" />}
                        label="Student Name"
                        value={card.studentName}
                      />
                      <InfoRow
                        icon={<BookOpen className="h-4 w-4 text-blue-600" />}
                        label="Class"
                        value={`${card.className || ''} ${card.section || ''}`.trim() || 'Not set'}
                        highlight
                      />
                      <InfoRow
                        icon={<Calendar className="h-4 w-4 text-blue-600" />}
                        label="Date of Birth"
                        value={card.dateOfBirth ? formatDate(card.dateOfBirth) : 'Not set'}
                      />
                      <InfoRow
                        icon={<MapPin className="h-4 w-4 text-blue-600" />}
                        label="Address"
                        value={maskAddress(card.address)}
                        masked
                      />
                    </div>

                    {/* Parent Details */}
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Parent Details</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InfoRow
                          icon={<User className="h-4 w-4 text-gray-500" />}
                          label="Father"
                          value={maskValue(card.fatherName, 4)}
                          masked
                        />
                        <InfoRow
                          icon={<Phone className="h-4 w-4 text-gray-500" />}
                          label="Father Mobile"
                          value={maskMobile(card.fatherMobile)}
                          masked
                        />
                        <InfoRow
                          icon={<User className="h-4 w-4 text-gray-500" />}
                          label="Mother"
                          value={maskValue(card.motherName, 4)}
                          masked
                        />
                        <InfoRow
                          icon={<Phone className="h-4 w-4 text-gray-500" />}
                          label="Mother Mobile"
                          value={maskMobile(card.motherMobile)}
                          masked
                        />
                      </div>
                    </div>

                    {/* Update Actions */}
                    <div className="border-t pt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Need to update something?</p>
                      <p className="text-xs text-gray-500">
                        For promoted students — update your class, address, or other details by messaging us on WhatsApp.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <UpdateButton label="Class / Section" onClick={() => openWhatsApp(card.studentName, 'Class/Section')} />
                        <UpdateButton label="Address" onClick={() => openWhatsApp(card.studentName, 'Address')} />
                        <UpdateButton label="Date of Birth" onClick={() => openWhatsApp(card.studentName, 'Date of Birth')} />
                        <UpdateButton label="Mobile Number" onClick={() => openWhatsApp(card.studentName, 'Mobile Number')} />
                        <UpdateButton label="Other Details" onClick={() => openWhatsApp(card.studentName, 'Other Details')} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

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

function InfoRow({
  icon,
  label,
  value,
  masked,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  masked?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-start gap-2 p-2 rounded-lg ${highlight ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-sm font-medium ${masked ? 'text-gray-400 font-mono tracking-wider' : 'text-gray-900'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function UpdateButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs border-green-300 text-green-700 hover:bg-green-50"
      onClick={onClick}
    >
      <MessageCircle className="h-3 w-3" />
      Update {label}
    </Button>
  );
}

export default PublicIDCardLookup;
