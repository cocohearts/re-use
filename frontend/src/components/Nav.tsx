import { useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { CircleUser, Menu, Search } from 'lucide-react';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import LoginModal from './LoginModal';
import { useNavigate } from 'react-router-dom';
import ProfilePicture from './ProfilePicture';
import { Button, buttonVariants } from './ui/button';

export default function Navbar() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="flex w-full justify-center py-4">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <Button variant="ghost">
          <Menu className="stroke-pine-900" />
        </Button>
        <div className="w-full max-w-lg">
          <div className="flex h-full items-center gap-2 rounded-full bg-pine-50 p-2 text-pine-900">
            <Search className="ml-1 stroke-pine-900" />
            <input
              className={
                'flex w-full rounded-md border border-transparent bg-transparent px-0 py-0 text-base ring-offset-transparent placeholder:text-pine-900 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-2'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  navigate('/?q=' + searchQuery);
                }
              }}
              placeholder="search"
            />
          </div>
        </div>
        <div className="flex items-center">
          {user ? (
            <ProfilePicture user={user} />
          ) : (
            <Dialog>
              <DialogTrigger>
                <CircleUser className="cursor-pointer stroke-pine-900" />
              </DialogTrigger>
              <LoginModal />
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
