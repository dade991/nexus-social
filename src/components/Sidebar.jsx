import { Home, Search, Bell, Mail, User, Menu, X, LogOut } from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const { activeTab, setActiveTab, user, unreadNotifications, logout } = useSocial();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Search' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadNotifications },
    { id: 'messages', icon: Mail, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>Nexus</h1>
        </div>
        
        <nav className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <item.icon size={24} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card" onClick={() => handleNavClick('profile')}>
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`} 
              alt={user?.name}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-handle">@{user?.username}</span>
            </div>
          </div>
          <button 
            className="nav-item" 
            onClick={handleLogout}
            style={{ color: 'var(--error)', marginTop: '8px' }}
          >
            <LogOut size={24} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
