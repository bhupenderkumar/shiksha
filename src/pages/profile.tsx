import { useProfile } from '@/services/profileService';

const ProfilePage = () => {
  const { profile, loading, error } = useProfile();

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
    <div>
      <h1>Profile</h1>
      <p>Name: {profile.full_name}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
      <img src={profile.avatar_url} alt="Avatar" />
    </div>
  );
};

export default ProfilePage;
