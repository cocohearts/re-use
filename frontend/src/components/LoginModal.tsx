import { useState } from 'react';
import supabase from '@/lib/supabase';
import { Input } from './ui/input';

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LoginModal() {
  const [kerb, setKerb] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState<boolean>(false);

  const validKerb = (k: string) => {
    return 3 <= k.length && k.length <= 8 && /^[a-z,0-9]+$/.test(k);
  };
  const sendEmail = async (k: string) => {
    if (validKerb(k)) {
      const { error } = await supabase.auth.signInWithOtp({
        email: k + '@mit.edu',
        options: {
          shouldCreateUser: true,
          //emailRedirectTo: ""
        },
      });
      if (error) {
        setError(error?.message);
      } else {
        setSent(true);
      }
    }
  };

  return (
    <DialogContent className="w-11/12 rounded-lg">
      <DialogHeader>
        <DialogTitle>Log in to re-use</DialogTitle>
        <div className="text-left">
          <label className="text-[16px]">email *</label>
          <div className="relative">
            <Input
              maxLength={8}
              className="mt-[8px]"
              placeholder="kerb"
              value={kerb}
              onChange={(e) => {
                setKerb(e.target.value.trim().replace(/[^a-z,0-9]+/, ''));
              }}
            />
            <span className="right-3 top-2 absolute">@mit.edu</span>
          </div>
        </div>
        <div className="text-left text-gray-400 mt-[8px] text-[12px]">
          re-use is currently only available for mit students. to help bring it
          to your college or university, contact us
        </div>
        <button
          className={
            'w-full text-white text-[18px] text-center mt-[24px] py-[13px] rounded-lg' +
            ' ' +
            (validKerb(kerb) ? 'bg-pine-800' : 'bg-gray-300')
          }
          onClick={() => {
            sendEmail(kerb);
          }}
        >
          send magic link
        </button>
        {error && (
          <div className="text-left text-red-800 mt-[8px] text-[12px]">
            {error}
          </div>
        )}
        {sent && (
          <div className="text-left text-pine-700 mt-[8px] text-[12px]">
            Email Sent!
          </div>
        )}
      </DialogHeader>
    </DialogContent>
  );
}
