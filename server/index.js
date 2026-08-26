const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'nexus-secret-key-2024-super-secure';

// Database setup
const db = new Database(path.join(__dirname, 'nexus.db'));

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT DEFAULT '',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    id TEXT PRIMARY KEY,
    follower_id TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    post_id TEXT DEFAULT '',
    content TEXT DEFAULT '',
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id)
  );
`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Helper function to create notification
const createNotification = (userId, fromUserId, type, postId = '', content = '') => {
  const id = uuidv4();
  db.prepare(`
    INSERT INTO notifications (id, user_id, from_user_id, type, post_id, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, fromUserId, type, postId, content);
};

// ============== AUTH ROUTES ==============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    db.prepare(`
      INSERT INTO users (id, username, email, password, name, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, username, email, hashedPassword, name, avatar);

    const token = jwt.sign({ id, username, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id, username, email, name, avatar, bio: '', followers_count: 0, following_count: 0, posts_count: 0 }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        name: user.name, 
        avatar: user.avatar,
        bio: user.bio,
        followers_count: user.followers_count,
        following_count: user.following_count,
        posts_count: user.posts_count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, email, name, avatar, bio, followers_count, following_count, posts_count, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// ============== USER ROUTES ==============

// Get user profile
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, username, name, avatar, bio, followers_count, following_count, posts_count, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  const isFollowing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, req.params.id);
  res.json({ ...user, isFollowing: !!isFollowing });
});

// Get user posts
app.get('/api/users/:id/posts', authenticateToken, (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.username, u.name, u.avatar,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id, req.params.id);
  
  res.json(posts);
});

// Update profile
app.put('/api/users/profile', authenticateToken, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), (req, res) => {
  const { name, bio } = req.body;
  const avatar = req.files?.avatar ? `/uploads/${req.files.avatar[0].filename}` : null;
  const cover_image = req.files?.cover ? `/uploads/${req.files.cover[0].filename}` : null;

  let query = 'UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio)';
  let params = [name, bio];

  if (avatar) {
    query += ', avatar = ?';
    params.push(avatar);
  }
  if (cover_image) {
    query += ', cover_image = ?';
    params.push(cover_image);
  }

  query += ' WHERE id = ?';
  params.push(req.user.id);

  db.prepare(query).run(...params);
  
  const user = db.prepare('SELECT id, username, email, name, avatar, bio, followers_count, following_count, posts_count FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// Follow user
app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const existingFollow = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, req.params.id);
  
  if (existingFollow) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, req.params.id);
    db.prepare('UPDATE users SET following_count = following_count - 1 WHERE id = ?').run(req.user.id);
    db.prepare('UPDATE users SET followers_count = followers_count - 1 WHERE id = ?').run(req.params.id);
    res.json({ following: false });
  } else {
    db.prepare('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)').run(uuidv4(), req.user.id, req.params.id);
    db.prepare('UPDATE users SET following_count = following_count + 1 WHERE id = ?').run(req.user.id);
    db.prepare('UPDATE users SET followers_count = followers_count + 1 WHERE id = ?').run(req.params.id);
    
    createNotification(req.params.id, req.user.id, 'follow');
    res.json({ following: true });
  }
});

// Search users
app.get('/api/users/search/:query', authenticateToken, (req, res) => {
  const users = db.prepare(`
    SELECT id, username, name, avatar, bio, followers_count, following_count, posts_count
    FROM users
    WHERE username LIKE ? OR name LIKE ?
    LIMIT 20
  `).all(`%${req.params.query}%`, `%${req.params.query}%`);
  
  res.json(users);
});

// ============== POST ROUTES ==============

// Get feed (posts from followed users + own posts)
app.get('/api/posts/feed', authenticateToken, (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.username, u.name, u.avatar,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id IN (
      SELECT following_id FROM follows WHERE follower_id = ?
    ) OR p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all(req.user.id, req.user.id);
  
  res.json(posts);
});

// Get all posts (explore)
app.get('/api/posts/explore', authenticateToken, (req, res) => {
  const posts = db.prepare(`
    SELECT p.*, u.username, u.name, u.avatar,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as liked,
           (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
           (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all(req.user.id);
  
  res.json(posts);
});

// Create post
app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { content } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';
  
  if (!content && !image) {
    return res.status(400).json({ error: 'Post must have content or image' });
  }

  const id = uuidv4();
  db.prepare('INSERT INTO posts (id, user_id, content, image) VALUES (?, ?, ?, ?)').run(id, req.user.id, content || '', image);
  db.prepare('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?').run(req.user.id);

  const post = db.prepare(`
    SELECT p.*, u.username, u.name, u.avatar, 0 as liked, 0 as likes_count, 0 as comments_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(id);
  
  res.json(post);
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  db.prepare('UPDATE users SET posts_count = posts_count - 1 WHERE id = ?').run(req.user.id);
  
  res.json({ success: true });
});

// ============== LIKE ROUTES ==============

// Like/unlike post
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const existingLike = db.prepare('SELECT id FROM likes WHERE user_id = ? AND post_id = ?').get(req.user.id, req.params.id);
  
  if (existingLike) {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(req.user.id, req.params.id);
    db.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?').run(req.params.id);
    res.json({ liked: false });
  } else {
    db.prepare('INSERT INTO likes (id, user_id, post_id) VALUES (?, ?, ?)').run(uuidv4(), req.user.id, req.params.id);
    db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(req.params.id);
    
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id);
    if (post.user_id !== req.user.id) {
      createNotification(post.user_id, req.user.id, 'like', req.params.id);
    }
    
    res.json({ liked: true });
  }
});

// ============== COMMENT ROUTES ==============

// Get comments for a post
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.name, u.avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.id);
  
  res.json(comments);
});

// Add comment
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content required' });

  const id = uuidv4();
  db.prepare('INSERT INTO comments (id, user_id, post_id, content) VALUES (?, ?, ?, ?)').run(id, req.user.id, req.params.id, content);
  db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(req.params.id);

  const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(req.params.id);
  if (post.user_id !== req.user.id) {
    createNotification(post.user_id, req.user.id, 'comment', req.params.id, content);
  }

  const comment = db.prepare(`
    SELECT c.*, u.username, u.name, u.avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `).get(id);
  
  res.json(comment);
});

// ============== MESSAGE ROUTES ==============

// Get conversations
app.get('/api/messages/conversations', authenticateToken, (req, res) => {
  const conversations = db.prepare(`
    SELECT DISTINCT 
      CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END as user_id,
      u.username, u.name, u.avatar,
      (SELECT content FROM messages WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_time,
      (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND read = 0) as unread_count
    FROM messages m
    JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id) AND u.id != ?
    WHERE m.sender_id = ? OR m.receiver_id = ?
    ORDER BY last_time DESC
  `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);
  
  res.json(conversations);
});

// Get messages with a user
app.get('/api/messages/:userId', authenticateToken, (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, 
           (SELECT username FROM users WHERE id = m.sender_id) as sender_username,
           (SELECT name FROM users WHERE id = m.sender_id) as sender_name,
           (SELECT avatar FROM users WHERE id = m.sender_id) as sender_avatar
    FROM messages m
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `).all(req.user.id, req.params.userId, req.params.userId, req.user.id);
  
  // Mark messages as read
  db.prepare('UPDATE messages SET read = 1 WHERE sender_id = ? AND receiver_id = ?').run(req.params.userId, req.user.id);
  
  res.json(messages);
});

// Send message
app.post('/api/messages/:userId', authenticateToken, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Message content required' });

  const id = uuidv4();
  db.prepare('INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)').run(id, req.user.id, req.params.userId, content);

  const message = db.prepare(`
    SELECT m.*, 
           (SELECT username FROM users WHERE id = m.sender_id) as sender_username,
           (SELECT name FROM users WHERE id = m.sender_id) as sender_name,
           (SELECT avatar FROM users WHERE id = m.sender_id) as sender_avatar
    FROM messages m
    WHERE m.id = ?
  `).get(id);
  
  res.json(message);
});

// ============== NOTIFICATION ROUTES ==============

// Get notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const notifications = db.prepare(`
    SELECT n.*, u.username, u.name, u.avatar
    FROM notifications n
    JOIN users u ON n.from_user_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(req.user.id);
  
  res.json(notifications);
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ success: true });
});

// ============== TRENDING ROUTES ==============

// Get trending hashtags
app.get('/api/trending', authenticateToken, (req, res) => {
  // Extract hashtags from posts and count them
  const posts = db.prepare('SELECT content FROM posts WHERE content LIKE "%#%"').all();
  const hashtagCounts = {};
  
  posts.forEach(post => {
    const hashtags = post.content.match(/#\w+/g) || [];
    hashtags.forEach(tag => {
      hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
    });
  });

  const trending = Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  res.json(trending);
});

// Seed some initial data
const seedData = async () => {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) return;

  console.log('Seeding initial data...');
  
  // Create demo users
  const users = [
    { username: 'alex_dev', email: 'alex@example.com', name: 'Alex Developer', bio: 'Full-stack developer 🚀' },
    { username: 'sarah_ux', email: 'sarah@example.com', name: 'Sarah Designer', bio: 'UX/UI Designer | Coffee lover ☕' },
    { username: 'mike_codes', email: 'mike@example.com', name: 'Mike Coder', bio: 'Building the future 💻' },
    { username: 'emma_writes', email: 'emma@example.com', name: 'Emma Writer', bio: 'Content creator | Bookworm 📚' },
  ];

  for (const user of users) {
    const id = uuidv4();
    const password = await bcrypt.hash('password123', 10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
    db.prepare('INSERT INTO users (id, username, email, password, name, bio, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, user.username, user.email, password, user.name, user.bio, avatar);
  }

  // Create some posts
  const allUsers = db.prepare('SELECT id, username FROM users').all();
  const samplePosts = [
    { content: 'Just launched my new project! 🚀 Check it out and let me know what you think.', image: '' },
    { content: 'The sunrise this morning was absolutely breathtaking. Sometimes you need to step away and appreciate the simple things. ☀️', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
    { content: 'Hot take: Dark mode should be the default for every app. Fight me. 🌙 #tech #design', image: '' },
    { content: 'Finally finished reading "Atomic Habits" by James Clear. This book changed my life! 📚 #books #productivity', image: '' },
    { content: 'Weekend coding session vibes! ☕💻 Who else is building something awesome?', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600' },
    { content: 'Learning React in 2024. The ecosystem has grown so much! #react #javascript #webdev', image: '' },
  ];

  for (let i = 0; i < samplePosts.length; i++) {
    const user = allUsers[i % allUsers.length];
    const id = uuidv4();
    db.prepare('INSERT INTO posts (id, user_id, content, image) VALUES (?, ?, ?, ?)').run(id, user.id, samplePosts[i].content, samplePosts[i].image);
    db.prepare('UPDATE users SET posts_count = posts_count + 1 WHERE id = ?').run(user.id);
  }

  console.log('Seed data created!');
};

seedData();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Nexus API server running on http://localhost:${PORT}`);
});
