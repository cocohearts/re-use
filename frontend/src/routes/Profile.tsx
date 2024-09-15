import { useAuthContext } from '@/components/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { token: authToken, user, authReady } = useAuthContext();
  const [userInfo, setUserInfo]: any = useState(null);
  const navigate = useNavigate();

  // Pull profile data from server
  useEffect(() => {
    if (authReady && !authToken) {
      // User is not logged in and should not be here
      navigate('/');
    }
  }, [authReady, authToken]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const res = await fetch(`/api/get-user/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        });
        const userInfo = (await res.json()).data;
        setUserInfo(userInfo);
      } catch (e) {
        console.log(`Error fetching profile: ${e}`);
      }
    })();
  }, [user]);

  return (
    <div className="px-4 text-pine-900">
      {/* Header */}
      <div className="flex flex-col items-start gap-2">
        {/* Name */}
        {userInfo ? (
          <h1 className="text-3xl font-bold">{userInfo.name}</h1>
        ) : (
          <Skeleton className="h-9 w-80 rounded-full" />
        )}

        {/* Karma pill */}
        {userInfo ? (
          <div className="flex items-center gap-2 rounded-full bg-zinc-100 py-1 pl-3 pr-3.5">
            <Star className="h-6 fill-pine-900 stroke-none" />
            <span>{userInfo.karma} karma</span>
          </div>
        ) : (
          <Skeleton className="h-8 w-36 rounded-full" />
        )}
      </div>
    </div>
  );
}
