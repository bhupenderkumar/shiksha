import { useEffect, useState } from 'react';
import { useProfile } from '@/services/profileService';
import { feesService, Fee } from '@/services/feesService';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { profile, loading, error } = useProfile();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

  useEffect(() => {
    if (profile && profile.role === 'STUDENT') {
      fetchStudentFees();
    }
  }, [profile]);

  const fetchStudentFees = async () => {
    try {
      setLoadingFees(true);
      const data = await feesService.getFeesByStudent(profile!.id);
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    } finally {
      setLoadingFees(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading profile: {error.message}</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div className="p-4">
      <Card className="p-6 mb-6">
        <div className="flex items-start gap-6">
          <img 
            src={profile.avatar_url || '/default-avatar.png'} 
            alt="Avatar" 
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold mb-2">{profile.full_name}</h1>
            <p className="text-gray-600 mb-1">Role: {profile.role}</p>
            <p className="text-gray-600">Email: {profile.email}</p>
          </div>
        </div>
      </Card>

      {profile.role === 'STUDENT' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Fee History</h2>
          {loadingFees ? (
            <div>Loading fees...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fees.map((fee) => (
                <Card key={fee.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{fee.feeType}</h3>
                      <p className="text-lg font-semibold mt-1">₹{fee.amount}</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm ${
                      fee.status === FeeStatus.PAID ? 'bg-green-100 text-green-800' :
                      fee.status === FeeStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {fee.status}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Due: {format(new Date(fee.dueDate), 'PP')}
                    </p>
                    {fee.description && (
                      <p className="text-sm text-gray-600 mt-1">{fee.description}</p>
                    )}
                  </div>
                </Card>
              ))}
              {fees.length === 0 && (
                <p className="text-gray-600">No fee records found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
