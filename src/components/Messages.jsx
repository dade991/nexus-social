import { useState } from 'react';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';

const mockConversations = [
  {
    id: 1,
    user: 'sarah_dev',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    lastMessage: 'That sounds great! Let me know when you\'re free',
    time: '2m ago',
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: 'Hey! Did you see the new design?', sent: false, time: '10:30 AM' },
      { id: 2, text: 'Yes! It looks amazing 🔥', sent: true, time: '10:32 AM' },
      { id: 3, text: 'Want to pair on the implementation?', sent: false, time: '10:33 AM' },
      { id: 4, text: 'That sounds great! Let me know when you\'re free', sent: false, time: '10:35 AM' },
    ]
  },
  {
    id: 2,
    user: 'mike_ux',
    name: 'Mike Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    lastMessage: 'The prototype is ready for review',
    time: '1h ago',
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: 'Can you check the latest mockups?', sent: false, time: '9:00 AM' },
      { id: 2, text: 'On it!', sent: true, time: '9:15 AM' },
      { id: 3, text: 'The prototype is ready for review', sent: false, time: '11:00 AM' },
    ]
  },
  {
    id: 3,
    user: 'emma_w',
    name: 'Emma Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    lastMessage: 'Thanks for the book recommendation!',
    time: '3h ago',
    unread: 0,
    online: true,
    messages: [
      { id: 1, text: 'You should read Atomic Habits', sent: true, time: '8:00 AM' },
      { id: 2, text: 'Thanks for the book recommendation!', sent: false, time: '11:00 AM' },
    ]
  }
];

export default function Messages() {
  const [conversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const updatedConversation = {
      ...selectedConversation,
      messages: [
        ...selectedConversation.messages,
        { id: Date.now(), text: newMessage, sent: true, time: 'Now' }
      ],
      lastMessage: newMessage
    };
    setSelectedConversation(updatedConversation);
    setNewMessage('');
  };

  return (
    <div className="messages">
      <div className="messages-sidebar">
        <header className="messages-header">
          <h2>Messages</h2>
        </header>
        
        <div className="messages-search">
          <Search size={18} />
          <input type="text" placeholder="Search messages..." />
        </div>

        <div className="conversations-list">
          {conversations.map((conv) => (
            <div 
              key={conv.id}
              className={`conversation-item ${selectedConversation.id === conv.id ? 'active' : ''}`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="conv-avatar-wrapper">
                <img src={conv.avatar} alt={conv.name} className="conv-avatar" />
                {conv.online && <span className="online-indicator" />}
              </div>
              <div className="conv-info">
                <div className="conv-header">
                  <span className="conv-name">{conv.name}</span>
                  <span className="conv-time">{conv.time}</span>
                </div>
                <p className="conv-last-message">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="unread-badge">{conv.unread}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        <header className="chat-header">
          <div className="chat-user">
            <img src={selectedConversation.avatar} alt={selectedConversation.name} />
            <div>
              <span className="chat-name">{selectedConversation.name}</span>
              <span className="chat-status">
                {selectedConversation.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="chat-actions">
            <button><Phone size={20} /></button>
            <button><Video size={20} /></button>
            <button><MoreVertical size={20} /></button>
          </div>
        </header>

        <div className="chat-messages">
          {selectedConversation.messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sent ? 'sent' : 'received'}`}>
              <p>{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={!newMessage.trim()}>
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
