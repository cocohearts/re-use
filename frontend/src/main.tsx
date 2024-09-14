import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFound from '@/routes/404';
import AuthProvider from './components/AuthProvider';
import Navbar from './components/Nav';
import SigninLink from './routes/Signin';
import ProfilePage from './routes/Profile';
import Browse from './routes/Browse';

const Wrapper = ({ children }: any) => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Navbar />
      {children}
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Wrapper>
        <Browse />
      </Wrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <Wrapper>
        <SigninLink />
      </Wrapper>
    ),
  },
  {
    path: '*',
    element: (
      <Wrapper>
        <NotFound />
      </Wrapper>
    ),
  },
  {
    path: '/profile',
    element: (
      <Wrapper>
        <ProfilePage />
      </Wrapper>
    ),
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*We should probably include some kind of wrapper here*/}
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
