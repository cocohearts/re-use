import { AvatarFallback } from '@radix-ui/react-avatar';
import { Avatar, AvatarImage } from './ui/avatar';

export default function ProfilePicture({ user }: any) {
  // For now, render a circle with first letter
  // user can be any object with an `email` field

  return (
    <Avatar className="flex items-center justify-center bg-pine-900 text-white">
      <AvatarImage src={user.pfp_url} />
      <AvatarFallback>{user.email.substring(0, 1)}</AvatarFallback>
    </Avatar>
  );
}
