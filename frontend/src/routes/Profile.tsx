import { useAuthContext } from '@/components/AuthProvider';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [userData, setUserData] = useState();

  const { token: authToken, user } = useAuthContext();
  console.log('authToken:', authToken);

  console.log('user:', user);

  useEffect(() => {
    (async () => {
      // Fetch user data
      await fetch('/api/get-user/');
    })();
  });
  // Pull profile data from server

  return (
    <div className="px-4">
      <h1>Hello world</h1>
    </div>
  );
}
