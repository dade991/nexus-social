import { useState, useEffect, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import { Send, Search, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';

export default function Messages() {
  const { conversations, fetchConversations, fetchMessages, sendMessage, user } = useSocial();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const data = await fetchMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
    setLoadingMessages(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      const message = await sendMessage(selectedConversation.user_id, newMessage);
      setMessages([...messages, message]);
      setNewMessage('');
      fetchConversations(); // Update conversation list
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="messages">
      <div className={`messages-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
        <header className="messages-header">
          <h2>Messages</h2>
        </header>
        
        <div className="messages-search">
          <Search size={18} />
          <input type="text" placeholder="Search messages..." />
        </div>

        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.user_id}
                className={`conversation-item ${selectedConversation?.user_id === conv.user_id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conv-avatar-wrapper">
                  <img src={conv.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.username}`} alt={conv.name} className="conv-avatar" />
                </div>
                <div className="conv-info">
                  <div className="conv-header">
                    <span className="conv-name">{conv.name}</span>
                    <span className="conv-time">{conv.last_time ? formatDate(conv.last_time) : ''}</span>
                  </div>
                  <p className="conv-last-message">{conv.last_message || 'No messages yet'}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="unread-badge">{conv.unread_count}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`chat-area ${!selectedConversation ? 'hidden-mobile' : ''}`}>
        {selectedConversation ? (
          <>
            <header className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="back-btn"
                  onClick={() => setSelectedConversation(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'none'
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-user">
                  <img 
                    src={selectedConversation.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.username}`} 
                    alt={selectedConversation.name} 
                  />
                  <div>
                    <span className="chat-name">{selectedConversation.name}</span>
                    <span className="chat-status">@{selectedConversation.username}</span>
                  </div>
                </div>
              </div>
              <div className="chat-actions">
                <button><Phone size={20} /></button>
                <button><Video size={20} /></button>
                <button><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="chat-messages">
              {loadingMessages ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No messages yet. Say hello! 👋
                </p>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}
                  >
                    <p>{msg.content}</p>
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
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
          </>
        ) : (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            <h3 style={{ marginBottom: '8px' }}>Select a conversation</h3>
            <p>Choose from your existing conversations</p>
          </div>
        )}
      </div>
    </div>
  );
}
