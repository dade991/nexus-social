import { createContext, useContext, useState, useEffect } from 'react';

const SocialContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || '';

const DEMO_MODE = !API_URL;

const demoUser = {
  id: 'demo-user-1',
  username: 'demo_user',
  email: 'demo@nexus.app',
  name: 'Demo User',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  bio: 'This is a demo account',
  followers_count: 123,
  following_count: 456,
  posts_count: 78
};

const demoPosts = [
  {
    id: '1',
    user_id: 'demo-user-1',
    username: 'demo_user',
    name: 'Demo User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    content: 'Welcome to Nexus! 🎉 This is a demo post. Sign up or login to create your own posts, like, comment, and connect with others!',
    image: '',
    likes_count: 42,
    comments_count: 5,
    liked: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    user_id: 'demo-user-2',
    username: 'alex_dev',
    name: 'Alex Developer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    content: 'Just shipped a new feature! 🚀 The possibilities are endless when you love what you do. #coding #development',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
    likes_count: 128,
    comments_count: 23,
    liked: true,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    user_id: 'demo-user-3',
    username: 'sarah_design',
    name: 'Sarah Designer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    content: 'Design is not just what it looks like and feels like. Design is how it works. 💡 #design #ux',
    image: '',
    likes_count: 89,
    comments_count: 12,
    liked: false,
    created_at: new Date(Date.now() - 14400000).toISOString()
  }
];

const demoNotifications = [
  { id: '1', type: 'like', from_user_id: 'demo-user-2', username: 'alex_dev', name: 'Alex Developer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', content: '', read: 0, created_at: new Date(Date.now() - 600000).toISOString() },
  { id: '2', type: 'follow', from_user_id: 'demo-user-3', username: 'sarah_design', name: 'Sarah Designer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', content: '', read: 0, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: '3', type: 'comment', from_user_id: 'demo-user-4', username: 'mike_code', name: 'Mike Coder', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', content: 'Great post!', read: 1, created_at: new Date(Date.now() - 3600000).toISOString() }
];

export function SocialProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (DEMO_MODE) {
      setUser(demoUser);
      setPosts(demoPosts);
      setNotifications(demoNotifications);
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            fetchPosts();
            fetchNotifications();
            fetchConversations();
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          setUser(demoUser);
          setPosts(demoPosts);
          setNotifications(demoNotifications);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    if (DEMO_MODE) {
      const demoToken = 'demo-token-' + Date.now();
      localStorage.setItem('token', demoToken);
      setToken(demoToken);
      setUser(demoUser);
      return { token: demoToken, user: demoUser };
    }

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
    if (DEMO_MODE) {
      const demoToken = 'demo-token-' + Date.now();
      localStorage.setItem('token', demoToken);
      setToken(demoToken);
      setUser({ ...demoUser, username, email, name });
      return { token: demoToken, user: { ...demoUser, username, email, name } };
    }

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
    if (DEMO_MODE) {
      setUser(demoUser);
      setPosts(demoPosts);
      setNotifications(demoNotifications);
    }
  };

  const fetchPosts = async () => {
    if (DEMO_MODE) {
      setPosts(demoPosts);
      return;
    }
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
    if (DEMO_MODE) {
      const newPost = {
        id: 'demo-' + Date.now(),
        user_id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        content,
        image: '',
        likes_count: 0,
        comments_count: 0,
        liked: false,
        created_at: new Date().toISOString()
      };
      setPosts([newPost, ...posts]);
      return newPost;
    }

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
    if (DEMO_MODE) {
      setPosts(posts.filter(p => p.id !== postId));
      return;
    }
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
    
    setPosts(posts.map(p => 
      p.id === postId ? { 
        ...p, 
        liked: newLiked, 
        likes_count: newLiked ? p.likes_count + 1 : p.likes_count - 1 
      } : p
    ));

    if (DEMO_MODE) return;

    try {
      await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, liked: !newLiked, likes_count: post.likes_count } : p
      ));
    }
  };

  const fetchComments = async (postId) => {
    if (DEMO_MODE) return [];
    const res = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const addComment = async (postId, content) => {
    if (DEMO_MODE) {
      const comment = {
        id: 'demo-comment-' + Date.now(),
        post_id: postId,
        user_id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        content,
        created_at: new Date().toISOString()
      };
      setPosts(posts.map(p => 
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
      ));
      return comment;
    }

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
    if (DEMO_MODE) return;
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
    if (DEMO_MODE) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: 1 } : n));
      return;
    }
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: 1 } : n));
  };

  const markAllNotificationsRead = async () => {
    if (DEMO_MODE) {
      setNotifications(notifications.map(n => ({ ...n, read: 1 })));
      return;
    }
    await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications(notifications.map(n => ({ ...n, read: 1 })));
  };

  const fetchConversations = async () => {
    if (DEMO_MODE) return;
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
    if (DEMO_MODE) return [];
    const res = await fetch(`${API_URL}/api/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const sendMessage = async (userId, content) => {
    if (DEMO_MODE) {
      return {
        id: 'demo-msg-' + Date.now(),
        sender_id: user.id,
        receiver_id: userId,
        content,
        sender_username: user.username,
        sender_name: user.name,
        sender_avatar: user.avatar,
        created_at: new Date().toISOString()
      };
    }
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
    if (DEMO_MODE) return { ...demoUser, id: userId, isFollowing: false };
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const fetchUserPosts = async (userId) => {
    if (DEMO_MODE) return demoPosts.filter(p => p.user_id === userId);
    const res = await fetch(`${API_URL}/api/users/${userId}/posts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  };

  const followUser = async (userId) => {
    if (DEMO_MODE) {
      return { following: true };
    }
    const res = await fetch(`${API_URL}/api/users/${userId}/follow`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data;
  };

  const updateProfile = async (formData) => {
    if (DEMO_MODE) return user;
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
    if (DEMO_MODE) return [];
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
      API_URL,
      isDemoMode: DEMO_MODE
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
