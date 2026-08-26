import { useState } from 'react';
import { Search as SearchIcon, TrendingUp, User } from 'lucide-react';

const trendingTopics = [
  { id: 1, tag: 'TechNews', posts: '12.4K' },
  { id: 2, tag: 'WebDevelopment', posts: '8.2K' },
  { id: 3, tag: 'AI', posts: '25.1K' },
  { id: 4, tag: 'ReactJS', posts: '5.7K' },
  { id: 5, tag: 'Design', posts: '3.4K' },
];

export default function Search() {
  const [query, setQuery] = useState('');

  const suggestedUsers = [
    { id: 1, username: 'sarah_dev', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', bio: 'Designer & Developer' },
    { id: 2, username: 'mike_ux', name: 'Mike Thompson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', bio: 'UX Designer' },
    { id: 3, username: 'emma_w', name: 'Emma Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', bio: 'Product Manager' },
    { id: 4, username: 'david_k', name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', bio: 'Software Engineer' },
  ];

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-input-wrapper">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search people, posts, or topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      {!query && (
        <>
          <section className="search-section">
            <h3>
              <TrendingUp size={18} />
              Trending
            </h3>
            <div className="trending-list">
              {trendingTopics.map((topic) => (
                <div key={topic.id} className="trending-item">
                  <div className="trending-info">
                    <span className="trending-tag">#{topic.tag}</span>
                    <span className="trending-posts">{topic.posts} posts</span>
                  </div>
                  <button className="follow-btn-small">Follow</button>
                </div>
              ))}
            </div>
          </section>

          <section className="search-section">
            <h3>
              <User size={18} />
              Who to follow
            </h3>
            <div className="suggested-users">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="suggested-user">
                  <img src={user.avatar} alt={user.name} className="suggested-avatar" />
                  <div className="suggested-info">
                    <span className="suggested-name">{user.name}</span>
                    <span className="suggested-handle">@{user.username}</span>
                    <span className="suggested-bio">{user.bio}</span>
                  </div>
                  <button className="follow-btn-small">Follow</button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {query && (
        <section className="search-results">
          <h3>Results for "{query}"</h3>
          <p className="no-results">No results found. Try a different search term.</p>
        </section>
      )}
    </div>
  );
}
