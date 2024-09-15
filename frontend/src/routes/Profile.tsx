import { useAuthContext } from '@/components/AuthProvider';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Leaf,
  Mail,
  MailOpen,
  PackageOpen,
  Plus,
  Receipt,
  Settings,
  Star,
} from 'lucide-react';
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
    <div className="text-pine-900">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start gap-2">
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

      <div className="mb-2 grid h-28 grid-cols-3 gap-2 text-xl">
        <Button className="flex h-full flex-col gap-1">
          <Plus />
          <p>add item</p>
        </Button>
        <Button className="flex h-full flex-col gap-1">
          <MailOpen />
          <p>view bids</p>
        </Button>
        <Button className="flex h-full flex-col gap-1">
          <Receipt />
          <p>activity</p>
        </Button>
      </div>

      <div className="mb-4 flex h-20 items-center justify-between rounded-md bg-pine-100 p-4">
        <span>
          Estimated CO<sub>2</sub> saved
        </span>
        <div className="flex gap-2 text-xl">
          <Leaf />
          {userInfo ? (
            <span className="font-bold">235 kg</span>
          ) : (
            <Skeleton className="h-7 w-16" />
          )}
        </div>
      </div>

      <hr className="mb-4" />

      <div className="flex w-full flex-col items-start justify-stretch">
        <Button
          className={cn('flex gap-4', 'w-full justify-start border-none px-2')}
        >
          <Settings className="h-5" /> Settings
        </Button>
        <Button
          className={cn('flex gap-4', 'w-full justify-start border-none px-2')}
        >
          <Mail className="h-5" /> Messages
        </Button>
        <Button
          className={cn('flex gap-4', 'w-full justify-start border-none px-2')}
        >
          <PackageOpen className="h-5" /> Earn by delivering
        </Button>
      </div>
    </div>
  );
}
