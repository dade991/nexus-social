import { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Search as SearchIcon, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Search() {
  const { searchUsers, user } = useSocial();
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

  return (
    <div className="search-page">
      <header className="search-header">
        <div className="search-input-wrapper">
          <SearchIcon size={20} />
          <input
            type="text"
            placeholder="Search people, posts, or topics..."
            value={query}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </header>

      {query.length >= 2 ? (
        <section className="search-results">
          <h3>Results for "{query}"</h3>
          {searching ? (
            <p className="no-results">Searching...</p>
          ) : results.length === 0 ? (
            <p className="no-results">No users found</p>
          ) : (
            <div className="suggested-users">
              {results.map((u) => (
                <div key={u.id} className="suggested-user">
                  <img 
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} 
                    alt={u.name} 
                    className="suggested-avatar" 
                  />
                  <div className="suggested-info">
                    <span className="suggested-name">{u.name}</span>
                    <span className="suggested-handle">@{u.username}</span>
                    <span className="suggested-bio">{u.bio || `${u.followers_count} followers`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="search-section">
            <h3>
              <TrendingUp size={18} />
              Suggested Users
            </h3>
            <div className="suggested-users">
              {results.length === 0 && (
                <>
                  <p className="no-results" style={{ padding: '16px', textAlign: 'center' }}>
                    Type to search for users
                  </p>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
