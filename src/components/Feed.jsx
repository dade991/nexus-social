import { useState, useRef } from 'react';
import { useSocial } from '../context/SocialContext';
import Post from './Post';
import { Image, Smile, Send, RefreshCw } from 'lucide-react';

export default function Feed() {
  const { posts, createPost, user, fetchPosts } = useSocial();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef(null);

  const handlePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;
    setPosting(true);
    try {
      await createPost(newPostContent, selectedImage);
      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsPosting(false);
    } catch (err) {
      console.error('Failed to create post:', err);
      alert(err.message);
    }
    setPosting(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  return (
    <div className="feed">
      <header className="feed-header">
        <h2>Home</h2>
        <button onClick={handleRefresh} className="refresh-btn" title="Refresh">
          <RefreshCw size={20} />
        </button>
      </header>

      <div className="create-post">
        <img 
          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} 
          alt={user?.name} 
          className="create-post-avatar" 
        />
        <div className="create-post-input-area">
          <textarea
            placeholder="What's happening?"
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            onClick={() => setIsPosting(true)}
            className="create-post-input"
          />
          
          {isPosting && (
            <>
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button 
                    className="remove-image"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="create-post-actions">
                <div className="create-post-tools">
                  <label className="tool-btn">
                    <Image size={18} />
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageSelect}
                      hidden
                    />
                  </label>
                  <button className="tool-btn">
                    <Smile size={18} />
                  </button>
                </div>
                <button 
                  className="post-btn"
                  onClick={handlePost}
                  disabled={(!newPostContent.trim() && !selectedImage) || posting}
                >
                  {posting ? 'Posting...' : (
                    <>
                      <Send size={18} />
                      Post
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="posts-feed">
        {posts.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No posts yet. Be the first to post something!
          </p>
        ) : (
          posts.map((post) => (
            <Post key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}
