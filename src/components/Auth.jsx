import { useState } from 'react';
import { useSocial } from '../context/SocialContext';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const { login, register } = useSocial();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password, formData.name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">Nexus</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <span className="input-icon">@</span>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <Lock size={18} className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {isLogin && (
          <div className="demo-accounts">
            <p>Demo mode available!</p>
            <small>Just click Sign In to explore the app</small>
            <button 
              type="button" 
              className="demo-btn"
              onClick={() => {
                localStorage.setItem('token', 'demo-token');
                window.location.reload();
              }}
            >
              Try Demo Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
