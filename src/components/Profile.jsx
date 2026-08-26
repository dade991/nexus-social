import { useState, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { MapPin, Link as LinkIcon, Calendar, Settings, LogOut, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import Post from './Post';

export default function Profile({ userId }) {
  const { user: currentUser, fetchUserProfile, fetchUserPosts, followUser, updateProfile, logout, setActiveTab } = useSocial();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetUserId = userId || currentUser?.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (!targetUserId) return;
      setLoading(true);
      try {
        const profileData = await fetchUserProfile(targetUserId);
        setProfile(profileData);
        setIsFollowing(profileData.isFollowing);
        setEditName(profileData.name);
        setEditBio(profileData.bio);
        
        const postsData = await fetchUserPosts(targetUserId);
        setUserPosts(postsData);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
      setLoading(false);
    };
    loadProfile();
  }, [targetUserId]);

  const handleFollow = async () => {
    try {
      const result = await followUser(targetUserId);
      setIsFollowing(result.following);
      setProfile(prev => ({
        ...prev,
        followers_count: result.following ? prev.followers_count + 1 : prev.followers_count - 1
      }));
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('bio', editBio);
    
    try {
      await updateProfile(formData);
      setProfile(prev => ({ ...prev, name: editName, bio: editBio }));
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="profile" style={{ textAlign: 'center', padding: '50px' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile" style={{ textAlign: 'center', padding: '50px' }}>
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="cover-image" />
        <div className="profile-info">
          <div className="profile-avatar-wrapper">
            <img 
              src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
              alt={profile.name} 
              className="profile-avatar" 
            />
          </div>
          
          <div className="profile-actions">
            {isOwnProfile ? (
              <>
                <button className="settings-btn">
                  <Settings size={20} />
                </button>
                <button className="logout-btn" onClick={logout} title="Logout">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button 
                className={isFollowing ? 'following-btn' : 'follow-btn'}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-name-row">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="name-input"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '1.25rem',
                  fontWeight: '700'
                }}
              />
            ) : (
              <h1 className="profile-name">{profile.name}</h1>
            )}
            <span className="profile-handle">@{profile.username}</span>
          </div>
        </div>

        {isEditing ? (
          <div className="bio-edit">
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="bio-textarea"
              placeholder="Write your bio..."
            />
            <div className="bio-edit-actions">
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveProfile} className="save-btn">Save</button>
            </div>
          </div>
        ) : (
          <div className="bio-row">
            <p className="profile-bio">{profile.bio || 'No bio yet'}</p>
            {isOwnProfile && (
              <button onClick={() => setIsEditing(true)} className="edit-bio-btn">
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}

        <div className="profile-stats">
          <div className="stat-item">
            <MapPin size={16} />
            <span>San Francisco, CA</span>
          </div>
          <div className="stat-item">
            <LinkIcon size={16} />
            <a href="#" className="profile-link">nexus.app</a>
          </div>
          <div className="stat-item">
            <Calendar size={16} />
            <span>Joined {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
          </div>
        </div>

        <div className="profile-numbers">
          <span><strong>{profile.following_count}</strong> Following</span>
          <span><strong>{profile.followers_count}</strong> Followers</span>
          <span><strong>{profile.posts_count}</strong> Posts</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="tab active">Posts</button>
        <button className="tab">Replies</button>
        <button className="tab">Media</button>
        <button className="tab">Likes</button>
      </div>

      <div className="profile-posts">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Post key={post.id} post={post} showFull={true} />
          ))
        ) : (
          <p className="no-posts">No posts yet</p>
        )}
      </div>
    </div>
  );
}
