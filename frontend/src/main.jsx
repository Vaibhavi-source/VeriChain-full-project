import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import './index.css';

// 1. Import our Layout and Page components
import App from './App.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyPage from './pages/VerifyPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProtectedRoute from './pages/ProtectedRoute.jsx';

// 2. Define our app's routes (the URL paths)
const router = createBrowserRouter([
  {
    path: '/',        // The "root" path
    element: <App />, // Will render our <App /> layout
    children: [       // Child pages will render inside <App />'s <Outlet />
      {
        index: true, // This is the default page (at "/")
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/verify',
        element: <VerifyPage />,
      },
      {
        element: <ProtectedRoute />, // The wrapper
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          // You can add more protected routes here later
          // e.g., { path: '/profile', element: <ProfilePage /> }
        ]
      },
    ],
  },
]);

// 3. Tell React to render our app with the router
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);