import { useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { CircleUser, Menu, Search } from 'lucide-react';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import LoginModal from './LoginModal';

export default function Navbar() {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState<string>('');
  return (
    <div className="flex w-full justify-center p-4">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <div>
          <Menu className="stroke-pine-900" />
        </div>
        <div className="w-full">
          <div className="flex h-full items-center gap-2 rounded-full bg-pine-50 p-2 text-pine-900">
            <Search className="ml-1 stroke-pine-900" />
            <input
              className={
                'flex w-full rounded-md border border-transparent bg-transparent px-0 py-0 text-sm ring-offset-transparent placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search"
            />
          </div>
        </div>
        <div className="flex items-center">
          {user ? null : ( // put a PFP here later.
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
