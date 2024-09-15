import { useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { CircleUser, Menu, Plus, Search, Store, User } from 'lucide-react';
import { Dialog, DialogTrigger } from '@radix-ui/react-dialog';
import LoginModal from './LoginModal';
import { useNavigate } from 'react-router-dom';
import ProfilePicture from './ProfilePicture';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Navbar() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <div className="flex w-full justify-center py-4">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="stroke-pine-900" />
            </Button>
          </SheetTrigger>
          <SheetContent className="text-pine-900" side="left">
            <SheetHeader className="mb-4">
              <SheetTitle>
                <a href="/">re-use</a>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col">
              <a className="flex items-center gap-4 px-2 py-3" href="/">
                <Store className="h-6" /> browse items
              </a>
              <a className="flex items-center gap-4 px-2 py-3" href="/add-item">
                <Plus className="h-6" /> add item
              </a>
              <hr className="my-3" />
              <a className="flex items-center gap-4 px-2 py-3" href="/profile">
                <User className="h-6" /> profile
              </a>
            </div>
          </SheetContent>
        </Sheet>

        <div className="w-full max-w-lg">
          <div className="flex h-full items-center gap-2 rounded-full bg-pine-50 p-2 text-pine-900">
            <Search className="ml-1 stroke-pine-900 cursor-pointer" onClick={() => navigate('/?q=' + searchQuery)} />
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
            <div className="cursor-pointer" onClick={() => navigate('/profile')}>
              <ProfilePicture user={user} />
            </div>
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
