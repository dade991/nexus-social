import { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Bookmark, Send, X } from 'lucide-react';

export default function Post({ post }) {
  const { likePost, addComment } = useSocial();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(post.id, newComment);
    setNewComment('');
  };

  return (
    <article className="post">
      <div className="post-header">
        <img src={post.avatar} alt={post.name} className="post-avatar" />
        <div className="post-meta">
          <span className="post-author">{post.name}</span>
          <span className="post-handle">@{post.username}</span>
          <span className="post-dot">·</span>
          <span className="post-time">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post" className="post-image" />
        )}
      </div>

      <div className="post-actions">
        <button 
          className={`action-btn ${post.liked ? 'liked' : ''}`}
          onClick={() => likePost(post.id)}
        >
          <Heart size={18} fill={post.liked ? '#e63946' : 'none'} />
          <span>{post.likes}</span>
        </button>
        
        <button 
          className={`action-btn ${showComments ? 'active' : ''}`}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} />
          <span>{post.comments.length}</span>
        </button>
        
        <button className="action-btn">
          <Share2 size={18} />
        </button>
        
        <button 
          className={`action-btn ${saved ? 'saved' : ''}`}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark size={18} fill={saved ? '#1d9bf0' : 'none'} />
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comment-input-wrapper">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=alex" 
              alt="You" 
              className="comment-avatar"
            />
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              className="comment-input"
            />
            {newComment && (
              <button className="send-comment" onClick={handleAddComment}>
                <Send size={16} />
              </button>
            )}
          </div>

          <div className="comments-list">
            {post.comments.map((comment) => (
              <div key={comment.id} className="comment">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`} 
                  alt={comment.name}
                  className="comment-avatar"
                />
                <div className="comment-body">
                  <div className="comment-header">
                    <span className="comment-author">{comment.name}</span>
                    <span className="comment-handle">@{comment.username}</span>
                    <span className="comment-time">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
