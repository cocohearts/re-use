import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NotFound from '@/routes/404';
import AuthProvider from './components/AuthProvider';
import Navbar from './components/Nav';
import SigninLink from './routes/Signin';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div className="bg-blue-300 text-white">Test</div>,
  },
  {
    path: '/login',
    element: <SigninLink />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*We should probably include some kind of wrapper here*/}
    <AuthProvider>
      <Navbar />
      <div className="mx-auto w-[clamp(0px,900px,90%)]">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  </StrictMode>,
);
