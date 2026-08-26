import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { SocialProvider, useSocial } from './context/SocialContext';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Search from './components/Search';
import Auth from './components/Auth';
import Profile from './components/Profile';
import './App.css';

function ProfileWrapper() {
  const { userId } = useParams();
  return <Profile userId={userId} />;
}

function AppContent() {
  const { activeTab, setActiveTab, user, loading } = useSocial();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Nexus...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className={`main-content ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<ProfileWrapper />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <div 
        className={`overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SocialProvider>
        <AppContent />
      </SocialProvider>
    </BrowserRouter>
  );
}

export default App;
