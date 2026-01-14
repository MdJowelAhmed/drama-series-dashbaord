import { Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useMemo } from 'react';

// Map paths to pageAccess values
const PAGE_ACCESS_MAP = {
  "/": "dashboard",
  "/movies": "movie",
  "/trailers": "trailer",
  "/ad-management": "ad",
  "/reports": "report",
  "/categories": "category",
  "/subscriptions": "subscription",
  "/remainder": "remainder",
  "/users": "user",
  "/controllers": "controller",
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Get user profile from localStorage
  const userProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      return <Navigate to="/login" replace />;
    }

    // Check if role is SUPER_ADMIN - full access
    if (decoded.role === 'SUPER_ADMIN') {
      return children;
    }

    // Check if role is ADMIN - verify page access
    if (decoded.role === 'ADMIN') {
      // Controller Management is only for SUPER_ADMIN
      if (location.pathname === '/controllers') {
        return <Navigate to="/" replace />;
      }

      // Check if ADMIN has access to this page
      if (userProfile?.pageAccess) {
        const accessiblePages = userProfile.pageAccess
          .filter((page) => page.access)
          .map((page) => page.name);

        const currentPageKey = PAGE_ACCESS_MAP[location.pathname];

        // Settings pages are accessible to all logged-in users
        if (location.pathname.startsWith('/settings')) {
          return children;
        }

        // Check if the current page is accessible
        if (currentPageKey && accessiblePages.includes(currentPageKey)) {
          return children;
        }

        // If no access, redirect to first accessible page or home
        const firstAccessiblePath = Object.entries(PAGE_ACCESS_MAP).find(
          ([, value]) => accessiblePages.includes(value)
        );

        if (firstAccessiblePath) {
          return <Navigate to={firstAccessiblePath[0]} replace />;
        }

        // No accessible pages found, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
        return <Navigate to="/login" replace />;
      }

      // No pageAccess data, allow access (will be restricted by sidebar)
      return children;
    }

    // If role is neither SUPER_ADMIN nor ADMIN, redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    return <Navigate to="/login" replace />;
  } catch (error) {
    // If token is invalid, remove it and redirect to login
    console.error('Token decode error:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;

