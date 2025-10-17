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

function App() {
  return (
    <Routes>
      <Route path="/" element={<LayoutWrapper />}>
        <Route index element={<OverviewPage />} />
        <Route path="dramas" element={<AllDramas />} />
        <Route path="dramas/:id" element={<DramaDetails />} />
        <Route path="movies/:id" element={<DramaDetails />} />
        <Route path="movies" element={<AllMovies />} />
        <Route path="subscriptions" element={<SubscriptionPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings/profile" element={<ProfilePage />} />
        <Route path="settings/password" element={<ChangePasswordPage />} />
        <Route path="settings/terms" element={<TermsPage />} />
        <Route path="settings/privacy" element={<PrivacyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
