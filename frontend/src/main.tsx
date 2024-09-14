import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import NotFound from '@/routes/404';

const router = createBrowserRouter([
  {
    path: "/",
    element: <div className="bg-blue-300 text-white">Test</div>,
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/*We should probably include some kind of wrapper here*/}
    <RouterProvider router={router} />
  </StrictMode>
)
