import { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import Post from './Post';
import { Image, Smile, Send } from 'lucide-react';

export default function Feed() {
  const { posts, addPost, currentUser } = useSocial();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = () => {
    if (!newPostContent.trim() && !selectedImage) return;
    addPost(newPostContent, selectedImage);
    setNewPostContent('');
    setSelectedImage(null);
    setIsPosting(false);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="feed">
      <header className="feed-header">
        <h2>Home</h2>
      </header>

      <div className="create-post">
        <img src={currentUser.avatar} alt={currentUser.name} className="create-post-avatar" />
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
              {selectedImage && (
                <div className="image-preview-container">
                  <img src={selectedImage} alt="Preview" className="image-preview" />
                  <button 
                    className="remove-image"
                    onClick={() => setSelectedImage(null)}
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
                  disabled={!newPostContent.trim() && !selectedImage}
                >
                  <Send size={18} />
                  Post
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="posts-feed">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
