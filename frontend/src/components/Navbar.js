import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBarChart, IconMap, IconCo2, IconUser, IconLogout } from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkBase = {
    display: 'flex', alignItems: 'center', gap: 6,
    textDecoration: 'none', fontSize: 14, padding: '6px 14px',
    borderRadius: 8, transition: 'all 0.15s',
  };

  return (
    <nav style={{
      background: '#1a1a2e', color: '#fff',
      padding: '0 32px', display: 'flex', alignItems: 'center',
      height: 60, justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <Link to="/" style={{ fontWeight: 700, fontSize: 18, color: '#fff', textDecoration: 'none', letterSpacing: 0.5 }}>
        <span style={{ color: '#4fc3f7' }}>Carbon</span> Monitor
      </Link>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Link to="/" style={{
          ...linkBase,
          color: isActive('/') ? '#fff' : '#8899aa',
          background: isActive('/') ? 'rgba(79,195,247,0.15)' : 'transparent',
        }}>
          <IconBarChart /> Dashboard
        </Link>
        <Link to="/regions" style={{
          ...linkBase,
          color: isActive('/regions') ? '#fff' : '#8899aa',
          background: isActive('/regions') ? 'rgba(79,195,247,0.15)' : 'transparent',
        }}>
          <IconMap /> Regions
        </Link>
        <Link to="/carbon" style={{
          ...linkBase,
          color: isActive('/carbon') ? '#fff' : '#8899aa',
          background: isActive('/carbon') ? 'rgba(79,195,247,0.15)' : 'transparent',
        }}>
          <IconCo2 /> Carbon Records
        </Link>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8899aa', marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #2a2a4a' }}>
          <IconUser /> {user?.name}
        </span>
        <button onClick={logout} style={{
          background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c',
          padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.target.style.background = '#e74c3c'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#e74c3c'; }}
        >
          <IconLogout /> Logout
        </button>
      </div>
    </nav>
  );
}
