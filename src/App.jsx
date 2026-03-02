import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SOSProvider } from './context/SOSContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import AuthModal from './components/AuthModal';
import AISafetyBot from './components/AISafetyBot';
import HomePage from './pages/HomePage';
import SOSPage from './pages/SOSPage';
import ResourcesPage from './pages/ResourcesPage';
import ForumPage from './pages/ForumPage';
import ProfilePage from './pages/ProfilePage';
import SafeRoutePage from './pages/SafeRoutePage';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-3 border-t-transparent mx-auto mb-4 animate-spin"
            style={{ borderColor: 'rgba(155,89,182,0.2)', borderTopColor: '#9B59B6' }} />
          <p className="text-sm font-montserrat" style={{ color: 'var(--text-muted)' }}>Loading SafeHer...</p>
        </div>
      </div>
    );
  }

  // Show auth page if user is not logged in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <SOSProvider>
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <Navbar />
        <main className="pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sos" element={<SOSPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/safe-route" element={<SafeRoutePage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
        <AuthModal />
        <AISafetyBot />
      </div>
    </SOSProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
