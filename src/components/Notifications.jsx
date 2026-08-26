import { useSocial } from '../context/SocialContext';
import { Heart, UserPlus, MessageCircle, Repeat2, Settings } from 'lucide-react';

export default function Notifications() {
  const { notifications, markNotificationRead } = useSocial();

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={18} className="notif-icon like" />;
      case 'follow': return <UserPlus size={18} className="notif-icon follow" />;
      case 'comment': return <MessageCircle size={18} className="notif-icon comment" />;
      case 'repost': return <Repeat2 size={18} className="notif-icon repost" />;
      default: return null;
    }
  };

  return (
    <div className="notifications">
      <header className="page-header">
        <h2>Notifications</h2>
        <button className="settings-icon">
          <Settings size={20} />
        </button>
      </header>

      <div className="notif-tabs">
        <button className="notif-tab active">All</button>
        <button className="notif-tab">Mentions</button>
        <button className="notif-tab">Verified</button>
      </div>

      <div className="notif-list">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`notif-item ${!notif.read ? 'unread' : ''}`}
            onClick={() => markNotificationRead(notif.id)}
          >
            <div className="notif-icon-wrapper">
              {getIcon(notif.type)}
            </div>
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.user}`} 
              alt={notif.user}
              className="notif-avatar"
            />
            <div className="notif-content">
              <p>
                <strong>{notif.user}</strong> {notif.content}
              </p>
              <span className="notif-time">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
