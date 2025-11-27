import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutWrapper from './layout/LayoutWrapper';
import OverviewPage from './pages/Overview/OverviewPage';
import AllDramas from './pages/Drama/AllDramas';
import DramaDetails from './pages/Drama/DramaDetails';
import AllMovies from './pages/Movie/AllMovies';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import UsersPage from './pages/Users/UsersPage';
import ProfilePage from './pages/Settings/ProfilePage';
import ChangePasswordPage from './pages/Settings/ChangePasswordPage';
import TermsPage from './pages/Settings/TermsPage';
import PrivacyPage from './pages/Settings/PrivacyPage';
import DramaManagementDashboard from './pages/report/report';
import TrailerManagement from './pages/trailers/TrailerManagement';
import CategoryManager from './pages/category/CategoryManagement';
import ControllerManagement from './pages/controller/ControllerManagement';

import { AuthLayout } from './layout/AuthLayout';
import ForgotPasswordPage from './pages/authentication/ForgotPassword';
import LoginPage from './pages/authentication/Login';
import AdManagement from './pages/ad-management/AdManagement';

function App() {
  return (
    
    <Routes>
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
   
  </Route>
      <Route path="/" element={<LayoutWrapper />}>
        <Route index element={<OverviewPage />} />
        <Route path="movies" element={<AllDramas />} />
        <Route path="movies/:id" element={<DramaDetails />} />
        {/* <Route path="movies/:id" element={<DramaDetails />} /> */}
        <Route path="movies" element={<AllMovies />} />
        <Route path="trailers" element={<TrailerManagement />} />
        <Route path="ad-management" element={<AdManagement />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
        <Route path="reports" element={<DramaManagementDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="controllers" element={<ControllerManagement />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/password" element={<ChangePasswordPage />} />
        <Route path="settings/agreement" element={<TermsPage />} />
        <Route path="settings/privacy" element={<PrivacyPage />} />
     
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
