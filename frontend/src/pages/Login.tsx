import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e8f5e9 0%, #f5f7f5 100%)'
}}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '24px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🌱</div>
          <h1 style={{ color: '#1b5e20', fontSize: '28px', fontWeight: '700' }}>CommunityGreen</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>Report & track environmental issues</p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '24px', color: '#1a1a1a', fontSize: '20px' }}>Welcome back</h2>
          {error && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '13px' }} disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2d7a2d', fontWeight: '600', textDecoration: 'none' }}>Create one free →</Link>
        </p>
      </div>
    </div>
  );
}