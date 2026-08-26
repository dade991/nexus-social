import { createContext, useContext, useState, useEffect } from 'react';

const SocialContext = createContext();

const API_URL = '';

export function SocialProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Fetch posts when logged in
  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchNotifications();
      fetchConversations();
    }
  }, [user]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password, name) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPosts([]);
    setNotifications([]);
    setConversations([]);
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/posts/explore`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  const createPost = async (content, imageFile) => {
    const formData = new FormData();
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    setPosts([data, ...posts]);
    return data;
  };

  const deletePost = async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setPosts(posts.filter(p => p.id !== postId));
    }
  };

  const likePost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    const newLiked = !post.liked;
    
    // Optimistic update
    setPosts(posts.map(p => 
      p.id === postId ? { 
        ...p, 
        liked: newLiked, 
        likes_count: newLiked ? p.likes_count + 1 : p.likes_count - 1 
      } : p
    ));

    try {
      await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Revert on error
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, liked: !newLiked, likes_count: post.likes_count } : p
      ));
    }
  };

  const fetchComments = async (postId) => {
    const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const addComment = async (postId, content) => {
    const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
    ));
    return data;
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const markNotificationRead = async (id) => {
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: 1 } : n));
  };

  const markAllNotificationsRead = async () => {
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => ({ ...n, read: 1 })));
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (userId) => {
    const res = await fetch(`${API_URL}/api/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const sendMessage = async (userId, content) => {
    const res = await fetch(`${API_URL}/api/messages/${userId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const fetchUserProfile = async (userId) => {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const fetchUserPosts = async (userId) => {
    const res = await fetch(`${API_URL}/api/users/${userId}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const followUser = async (userId) => {
    const res = await fetch(`${API_URL}/api/users/${userId}/follow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  };

  const updateProfile = async (formData) => {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setUser(data);
    return data;
  };

  const searchUsers = async (query) => {
    const res = await fetch(`${API_URL}/api/users/search/${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <SocialContext.Provider value={{
      user,
      token,
      loading,
      posts,
      notifications,
      conversations,
      activeTab,
      setActiveTab,
      searchQuery,
      setSearchQuery,
      unreadNotifications,
      login,
      register,
      logout,
      fetchPosts,
      createPost,
      deletePost,
      likePost,
      fetchComments,
      addComment,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      fetchConversations,
      fetchMessages,
      sendMessage,
      fetchUserProfile,
      fetchUserPosts,
      followUser,
      updateProfile,
      searchUsers,
      API_URL
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within SocialProvider');
  }
  return context;
}
