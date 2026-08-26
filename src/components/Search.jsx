import { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Search as SearchIcon, TrendingUp } from 'lucide-react';

export default function Search() {
  const { searchUsers, user, setActiveTab } = useSocial();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const data = await searchUsers(value);
      setResults(data.filter(u => u.id !== user?.id));
    } catch (err) {
      console.error('Search failed:', err);
    }
    setSearching(false);
  };

  const viewProfile = (userId) => {
    setActiveTab('profile');
  };

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-input-wrapper">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search people..."
            value={query}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </header>

      {query.length >= 2 ? (
        <section className="search-section">
          <h3>Results for "{query}"</h3>
          {searching ? (
            <p className="no-results">Searching...</p>
          ) : results.length === 0 ? (
            <p className="no-results">No users found</p>
          ) : (
            <div className="suggested-users">
              {results.map((u) => (
                <div 
                  key={u.id} 
                  className="suggested-user"
                  onClick={() => viewProfile(u.id)}
                >
                  <img 
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                    alt={u.name} 
                    className="suggested-avatar" 
                  />
                  <div className="suggested-info">
                    <span className="suggested-name">{u.name}</span>
                    <span className="suggested-handle">@{u.username}</span>
                    <span className="suggested-bio">{u.bio || `${u.followers_count || 0} followers`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="search-section">
          <h3>
            <TrendingUp size={18} />
            Search for Users
          </h3>
          <p className="no-results" style={{ padding: '16px', textAlign: 'center' }}>
            Type at least 2 characters to search for users
          </p>
        </section>
      )}
    </div>
  );
}
