import { useAuthContext } from '@/components/AuthProvider';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { token: authToken, user } = useAuthContext();

  // Pull profile data from server
  useEffect(() => {
    if (!user) return;

    (async () => {
      console.log('running async fetch...');
      const res = await fetch(`/api/get-user/${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      console.log('result:', res);
    })();
  }, [user]);

  return (
    <div className="px-4">
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
