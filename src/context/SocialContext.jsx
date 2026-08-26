import { createContext, useContext, useState } from 'react';

const SocialContext = createContext();

const initialPosts = [
  {
    id: 1,
    userId: 1,
    username: 'alex_rivera',
    name: 'Alex Rivera',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    content: 'Just launched my new project! 🚀 Check it out and let me know what you think. Building in public is the best way to stay accountable.',
    image: null,
    likes: 47,
    comments: [
      { id: 1, userId: 2, username: 'sarah_dev', name: 'Sarah Chen', content: 'This looks amazing! Congrats on the launch! 🎉', createdAt: new Date(Date.now() - 3600000) },
      { id: 2, userId: 3, username: 'mike_ux', name: 'Mike Thompson', content: 'Clean design! I love the minimalist approach.', createdAt: new Date(Date.now() - 1800000) }
    ],
    createdAt: new Date(Date.now() - 7200000),
    liked: false
  },
  {
    id: 2,
    userId: 2,
    username: 'sarah_dev',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    content: 'The sunrise this morning was absolutely breathtaking. Sometimes you need to step away from the code and appreciate the simple things. ☀️',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    likes: 128,
    comments: [
      { id: 3, userId: 4, username: 'emma_w', name: 'Emma Wilson', content: 'Nature heals everything! 📸', createdAt: new Date(Date.now() - 900000) }
    ],
    createdAt: new Date(Date.now() - 14400000),
    liked: true
  },
  {
    id: 3,
    userId: 3,
    username: 'mike_ux',
    name: 'Mike Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    content: 'Hot take: Dark mode should be the default for every app. Fight me. 🌙',
    likes: 89,
    comments: [],
    createdAt: new Date(Date.now() - 28800000),
    liked: false
  },
  {
    id: 4,
    userId: 4,
    username: 'emma_w',
    name: 'Emma Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    content: 'Finally finished reading "Atomic Habits" by James Clear. This book completely changed my perspective on building good habits and breaking bad ones. Highly recommend! 📚',
    image: null,
    likes: 56,
    comments: [
      { id: 4, userId: 1, username: 'alex_rivera', name: 'Alex Rivera', content: 'One of my favorites too! The 1% better every day concept is powerful.', createdAt: new Date(Date.now() - 600000) }
    ],
    createdAt: new Date(Date.now() - 43200000),
    liked: false
  },
  {
    id: 5,
    userId: 5,
    username: 'david_k',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    content: 'Weekend coding session vibes! ☕💻 Who else is building something awesome this weekend?',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    likes: 203,
    comments: [
      { id: 5, userId: 2, username: 'sarah_dev', name: 'Sarah Chen', content: 'Same here! Coffee is my best friend right now 😄', createdAt: new Date(Date.now() - 300000) }
    ],
    createdAt: new Date(Date.now() - 57600000),
    liked: true
  }
];

const initialUsers = [
  { id: 1, username: 'alex_rivera', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', bio: 'Full-stack developer | Building cool things', followers: 1234, following: 567, posts: 45 },
  { id: 2, username: 'sarah_dev', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', bio: 'Designer & Developer | Coffee enthusiast ☕', followers: 2345, following: 432, posts: 89 },
  { id: 3, username: 'mike_ux', name: 'Mike Thompson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', bio: 'UX Designer | Creating beautiful experiences', followers: 876, following: 321, posts: 34 },
  { id: 4, username: 'emma_w', name: 'Emma Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', bio: 'Product Manager | Bookworm 📚', followers: 1567, following: 234, posts: 67 },
  { id: 5, username: 'david_k', name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', bio: 'Software Engineer | Weekend hacker 💻', followers: 987, following: 456, posts: 56 }
];

export function SocialProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts);
  const [users] = useState(initialUsers);
  const [currentUser] = useState(initialUsers[0]);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'like', user: 'sarah_dev', content: 'liked your post', time: '2m ago', read: false },
    { id: 2, type: 'follow', user: 'emma_w', content: 'started following you', time: '15m ago', read: false },
    { id: 3, type: 'comment', user: 'mike_ux', content: 'commented on your post', time: '1h ago', read: true },
  ]);

  const addPost = (content, image) => {
    const newPost = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      name: currentUser.name,
      avatar: currentUser.avatar,
      content,
      image,
      likes: 0,
      comments: [],
      createdAt: new Date(),
      liked: false
    };
    setPosts([newPost, ...posts]);
  };

  const likePost = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const addComment = (postId, content) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            content,
            createdAt: new Date()
          }]
        };
      }
      return post;
    }));
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const filteredPosts = searchQuery 
    ? posts.filter(p => p.content.toLowerCase().includes(searchQuery.toLowerCase()) || p.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : posts;

  return (
    <SocialContext.Provider value={{
      posts: filteredPosts,
      users,
      currentUser,
      activeTab,
      setActiveTab,
      addPost,
      likePost,
      addComment,
      searchQuery,
      setSearchQuery,
      notifications,
      markNotificationRead
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
