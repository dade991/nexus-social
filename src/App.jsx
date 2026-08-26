import { useState, useEffect } from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import Sidebar from './components/Sidebar';
import Feed from './components/Feed';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import Search from './components/Search';
import Profile from './components/Profile';
import Auth from './components/Auth';
import './App.css';

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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Feed />;
      case 'profile':
        return <Profile />;
      case 'notifications':
        return <Notifications />;
      case 'messages':
        return <Messages />;
      case 'search':
        return <Search />;
      default:
        return <Feed />;
    }
  };

  return (
    <div className="app">
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className={`main-content ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {renderContent()}
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
    <SocialProvider>
      <AppContent />
    </SocialProvider>
  );
}

export default App;
