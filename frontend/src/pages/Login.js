import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (e) {
      setErr(e.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: 20 }}>
      <div style={{ width: 400, background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
        <div style={{ padding: '32px 32px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>
              <span style={{ color: '#4fc3f7' }}>Carbon</span> Monitor
            </div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>Sign in to your account</div>
          </div>
          {err && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fecaca' }}>
              {err}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '0 32px 32px' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>Email</label>
            <input
              type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8,
                fontSize: 14, outline: 'none', transition: 'border-color 0.15s', display: 'block',
              }}
              onFocus={e => e.target.style.borderColor = '#4fc3f7'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6, display: 'block' }}>Password</label>
            <input
              type="password" placeholder="Your password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8,
                fontSize: 14, outline: 'none', transition: 'border-color 0.15s', display: 'block',
              }}
              onFocus={e => e.target.style.borderColor = '#4fc3f7'}
              onBlur={e => e.target.style.borderColor = '#e0e0e0'}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 12, background: loading ? '#8899aa' : '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600, transition: 'background 0.15s',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#888' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#4fc3f7', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
