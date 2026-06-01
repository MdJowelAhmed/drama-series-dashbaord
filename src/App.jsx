import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import LayoutWrapper from './layout/LayoutWrapper';
import { AuthLayout } from './layout/AuthLayout';
import PrivateRoute from './components/PrivateRoute';

// Route-level code splitting: each page is loaded on demand,
// keeping the initial bundle small and first load fast.
const OverviewPage = lazy(() => import('./pages/Overview/OverviewPage'));
const AllDramas = lazy(() => import('./pages/Drama/AllDramas'));
const DramaDetails = lazy(() => import('./pages/Drama/DramaDetails'));
const SubscriptionPage = lazy(() => import('./pages/Subscription/SubscriptionPage'));
const UsersPage = lazy(() => import('./pages/Users/UsersPage'));
const ProfilePage = lazy(() => import('./pages/Settings/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/Settings/ChangePasswordPage'));
const TermsPage = lazy(() => import('./pages/Settings/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/Settings/PrivacyPage'));
const DramaManagementDashboard = lazy(() => import('./pages/report/report'));
const TrailerManagement = lazy(() => import('./pages/trailers/TrailerManagement'));
const CategoryManager = lazy(() => import('./pages/category/CategoryManagement'));
const ControllerManagement = lazy(() => import('./pages/controller/ControllerManagement'));
const AdManagement = lazy(() => import('./pages/ad-management/AdManagement'));
const RemainderManage = lazy(() => import('./pages/remainder/RemainderManage'));
const LoginImage = lazy(() => import('./pages/loginImage/LoginImage'));
const FaqSection = lazy(() => import('./pages/faq/FaqSection'));
const LoginPage = lazy(() => import('./pages/authentication/Login'));
const ForgotPasswordPage = lazy(() => import('./pages/authentication/ForgotPassword'));
const VerifyOtpPage = lazy(() => import('./pages/authentication/VerifyOtp'));
const ResetPasswordPage = lazy(() => import('./pages/authentication/ResetPassword'));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <LayoutWrapper />
            </PrivateRoute>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="series" element={<AllDramas />} />
          <Route path="movies/:id" element={<DramaDetails />} />
          <Route path="trailers" element={<TrailerManagement />} />
          <Route path="ad-management" element={<AdManagement />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="subscriptions" element={<SubscriptionPage />} />
          <Route path="reports" element={<DramaManagementDashboard />} />
          <Route path="faq" element={<FaqSection />} />
          <Route path="remainder" element={<RemainderManage />} />
          <Route path="login-image" element={<LoginImage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="controllers" element={<ControllerManagement />} />
          <Route path="settings/profile" element={<ProfilePage />} />
          <Route path="settings/password" element={<ChangePasswordPage />} />
          <Route path="settings/agreement" element={<TermsPage />} />
          <Route path="settings/privacy" element={<PrivacyPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
