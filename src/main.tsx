import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'

import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import SearchPage from './pages/SearchPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/about',
    element: <AboutPage />,
    errorElement: <NotFoundPage />
  },
  {
    path: "/browse",
    element: <NotFoundPage />
  },
  {
    path: '/browse/:game',
    element: <BrowsePage />, 
    errorElement: <NotFoundPage />
  },
  {
    path: "/search",
    element: <SearchPage />,
    errorElement: <NotFoundPage />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
