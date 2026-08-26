import { useSocial } from '../context/SocialContext';
import { MapPin, Link as LinkIcon, Calendar, Settings, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function Profile() {
  const { currentUser, posts } = useSocial();
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(currentUser.bio);

  const userPosts = posts.filter(p => p.userId === currentUser.id);

  const handleSaveBio = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile">
      <div className="profile-header">
        <div className="cover-image" />
        <div className="profile-info">
          <div className="profile-avatar-wrapper">
            <img src={currentUser.avatar} alt={currentUser.name} className="profile-avatar" />
            <button className="edit-avatar-btn">
              <Edit2 size={16} />
            </button>
          </div>
          
          <div className="profile-actions">
            <button className="settings-btn">
              <Settings size={20} />
            </button>
            <button className="follow-btn">Follow</button>
          </div>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-name-row">
          <div>
            <h1 className="profile-name">{currentUser.name}</h1>
            <span className="profile-handle">@{currentUser.username}</span>
          </div>
        </div>

        {isEditing ? (
          <div className="bio-edit">
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="bio-textarea"
            />
            <div className="bio-edit-actions">
              <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleSaveBio} className="save-btn">Save</button>
            </div>
          </div>
        ) : (
          <div className="bio-row">
            <p className="profile-bio">{editBio}</p>
            <button onClick={() => setIsEditing(true)} className="edit-bio-btn">
              <Edit2 size={14} />
            </button>
          </div>
        )}

        <div className="profile-stats">
          <div className="stat-item">
            <MapPin size={16} />
            <span>San Francisco, CA</span>
          </div>
          <div className="stat-item">
            <LinkIcon size={16} />
            <a href="#" className="profile-link">alexrivera.dev</a>
          </div>
          <div className="stat-item">
            <Calendar size={16} />
            <span>Joined February 2023</span>
          </div>
        </div>

        <div className="profile-numbers">
          <span><strong>{currentUser.following}</strong> Following</span>
          <span><strong>{currentUser.followers}</strong> Followers</span>
          <span><strong>{userPosts.length}</strong> Posts</span>
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
            <div key={post.id} className="profile-post">
              <p>{post.content}</p>
              {post.image && <img src={post.image} alt="" className="profile-post-image" />}
              <div className="profile-post-stats">
                <span>❤️ {post.likes}</span>
                <span>💬 {post.comments.length}</span>
                <span>{format(post.createdAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="no-posts">No posts yet</p>
        )}
      </div>
    </div>
  );
}
