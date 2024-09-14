import React, { useState } from 'react';
import { useAuthContext } from './AuthProvider';
import { CircleUser, Menu, Search } from 'lucide-react';

export default function Navbar() {
  const [user] = useAuthContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  return (
    <div className="w-full bg-[#EFF3EC] flex justify-center py-2">
      <div className="flex flex-row justify-between gap-2 w-[min(100%,600px)] items-center">
        <div>
          <Menu />
        </div>
        <div className="w-full">
          <div className="rounded-full bg-[#DEE6D8] text-[16px] h-full flex gap-2 p-2 items-center">
            <Search />
            <input
              className={
                "bg-transparent flex w-full rounded-md border border-transparent px-0 py-0 text-sm ring-offset-transparent placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              }
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder='search'
            />
          </div>
        </div>
        <div>
          {
            user ? (
              null // put a PFP here later.
            ) : (
              <CircleUser />
            )
          }
          {/* Profile here? */}
        </div>
      </div>
    </div>
  )
}
