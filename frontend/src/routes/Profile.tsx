import { useAuthContext } from '@/components/AuthProvider';

export default function ProfilePage() {
  const { token: authToken } = useAuthContext();
  console.log('authToken:', authToken);

  // Pull profile data from server

  return (
    <div className="px-4">
      <h1>Hello world</h1>
    </div>
  );
}
