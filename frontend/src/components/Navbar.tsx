import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navLink = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link to={to} style={{
        color: active ? '#4ade80' : '#6b9a6b',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: active ? '700' : '500',
        padding: '6px 14px',
        borderRadius: '8px',
        background: active ? 'rgba(74,222,128,0.1)' : 'transparent',
        border: active ? '1px solid rgba(74,222,128,0.2)' : '1px solid transparent',
        transition: 'all 0.2s',
      }}>{label}</Link>
    );
  };

  return (
    <nav style={{
      background: '#0d170d',
      borderBottom: '1px solid #1e3a1e',
      padding: '0 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '60px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px',
          background: '#16a34a',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '16px',
        }}>🌱</div>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#4ade80', letterSpacing: '-0.3px' }}>
          CommunityGreen
        </span>
      </Link>

      {token && (
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {navLink('/', '🏠 Home')}
          {navLink('/report', '📢 Report')}
          {navLink('/profile', '👤 Profile')}
          <button onClick={logout} style={{
            background: 'transparent', color: '#6b9a6b',
            padding: '6px 14px', borderRadius: '8px',
            fontSize: '13px', fontWeight: '500',
            marginLeft: '8px',
            border: '1px solid #1e3a1e',
          }}>Sign out</button>
        </div>
      )}
    </nav>
  );
}