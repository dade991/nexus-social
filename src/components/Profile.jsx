import { useState, useEffect } from 'react';
import { useSocial } from '../context/SocialContext';
import { Calendar, LogOut, Edit2 } from 'lucide-react';
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
        if (profileData) {
          setProfile(profileData);
          setIsFollowing(profileData.isFollowing || false);
          setEditName(profileData.name || '');
          setEditBio(profileData.bio || '');
        }
        
        const postsData = await fetchUserPosts(targetUserId);
        setUserPosts(postsData || []);
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
      setProfile(prev => prev ? {
        ...prev,
        followers_count: result.following ? (prev.followers_count || 0) + 1 : (prev.followers_count || 1) - 1
      } : null);
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('bio', editBio);
    
    try {
      const updated = await updateProfile(formData);
      if (updated) {
        setProfile(prev => prev ? { ...prev, name: editName, bio: editBio } : prev);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="profile" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile" style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
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
                <button className="settings-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={20} />
                </button>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
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
          <p className="profile-bio" style={{ marginBottom: '12px' }}>
            {profile.bio || 'No bio yet'}
          </p>
        )}

        <div className="profile-stats">
          <div className="stat-item">
            <Calendar size={16} />
            <span>Joined {profile.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : 'recently'}</span>
          </div>
        </div>

        <div className="profile-numbers">
          <span><strong>{profile.following_count || 0}</strong> Following</span>
          <span><strong>{profile.followers_count || 0}</strong> Followers</span>
          <span><strong>{profile.posts_count || userPosts.length}</strong> Posts</span>
        </div>
      </div>

      <div className="profile-tabs">
        <button className="tab active">Posts</button>
      </div>

      <div className="profile-posts">
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))
        ) : (
          <p className="no-posts">No posts yet</p>
        )}
      </div>
    </div>
  );
}
