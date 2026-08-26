import { useSocial } from '../context/SocialContext';
import { Heart, UserPlus, MessageCircle, Settings, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadNotifications } = useSocial();

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={18} className="notif-icon like" fill="#f91880" />;
      case 'follow': return <UserPlus size={18} className="notif-icon follow" />;
      case 'comment': return <MessageCircle size={18} className="notif-icon comment" />;
      default: return null;
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'follow':
        return 'started following you';
      case 'comment':
        return notification.content ? `commented: "${notification.content.substring(0, 30)}${notification.content.length > 30 ? '...' : ''}"` : 'commented on your post';
      default:
        return notification.content || '';
    }
  };

  return (
    <div className="notifications">
      <header className="page-header">
        <h2>Notifications</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadNotifications > 0 && (
            <button 
              className="settings-icon" 
              onClick={markAllNotificationsRead}
              title="Mark all as read"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}
            >
              <Check size={16} />
              <span style={{ fontSize: '0.8rem' }}>Read all</span>
            </button>
          )}
          <button className="settings-icon">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <div className="notif-tabs">
        <button className="notif-tab active">All</button>
        <button className="notif-tab">Mentions</button>
        <button className="notif-tab">Verified</button>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No notifications yet
          </p>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notif-item ${!notif.read ? 'unread' : ''}`}
              onClick={() => markNotificationRead(notif.id)}
            >
              <div style={{ position: 'absolute', marginLeft: '40px' }}>
                {getIcon(notif.type)}
              </div>
              <img 
                src={notif.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.username}`} 
                alt={notif.name}
                className="notif-avatar"
              />
              <div className="notif-content">
                <p>
                  <strong>{notif.name}</strong> {getNotificationText(notif)}
                </p>
                <span className="notif-time">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
