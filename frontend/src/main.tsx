import NotFound from '@/routes/404';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import Navbar from './components/Nav';
import './index.css';
import AddItemPage from './routes/AddItem';
import Browse from './routes/Browse';
import ProfilePage from './routes/Profile';
import SigninLink from './routes/Signin';
import SingleItem from './routes/SingleItem';

const Wrapper = ({ children }: any) => {
  return (
    <div className="mx-auto mb-10 w-full max-w-2xl px-4">
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
    path: '/item/:uuid',
    element: (
      <Wrapper>
        <SingleItem />
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
  {
    path: '/add-item',
    element: (
      <Wrapper>
        <AddItemPage />
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
