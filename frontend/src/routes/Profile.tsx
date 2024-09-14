import { useEffect } from 'react';

export default function ProfilePage() {
  useEffect(() => {
    console.log('hello world');
  });

  return (
    <div className="px-4">
      <h1>Hello world</h1>
    </div>
  );
}
