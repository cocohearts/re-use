import { useEffect } from 'react';

export default function SigninLink() {
  useEffect(() => {
    const redirectLink = new URLSearchParams(window.location.search).get("link")
    redirectLink && window.location.replace(redirectLink);
  }, [])
  return null;
}
