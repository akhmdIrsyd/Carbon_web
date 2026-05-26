import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import MapPicker from '../components/MapPicker';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconLocation } from '../components/Icons';

const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'block', outline: 'none', transition: 'border-color 0.15s' };
const card = { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' };
const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' };
const th = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' };
const thNoSort = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12 };

function SortIcon({ dir }) { return <span style={{ fontSize: 10, marginLeft: 4, opacity: dir ? 1 : 0.3 }}>{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>; }

const severityColor = (s) => s === 'Aman' ? '#27ae60' : s === 'Waspada' ? '#f39c12' : s === 'Siaga' ? '#e67e22' : s === 'Berbahaya' ? '#e74c3c' : s === 'Sangat Berbahaya' ? '#8e44ad' : '#ccc';

export default function Regions() {
  const [regions, setRegions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', description: '' });
  const [mapPos, setMapPos] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: '', dir: '' });

  const loadRegions = () => api.get('/api/regions').then((r) => setRegions(r.data));
  useEffect(() => { loadRegions(); }, []);

  const filtered = useMemo(() => {
    const f = regions.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));
    if (!sort.key) return f;
    return [...f].sort((a, b) => {
      let va = a[sort.key], vb = b[sort.key];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va == null) va = ''; if (vb == null) vb = '';
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [regions, search, sort]);

  const handleSort = (key) => setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const resetForm = () => { setForm({ name: '', latitude: '', longitude: '', description: '' }); setMapPos(null); setEditing(null); setShowForm(false); };
  const handleMapClick = (latlng) => { setForm({ ...form, latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) }); setMapPos([latlng.lat, latlng.lng]); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) await api.put(`/api/regions/${editing.id}`, form); else await api.post('/api/regions', form); resetForm(); loadRegions(); } catch (err) { alert(err.response?.data?.message || 'Error saving region'); }
  };
  const handleEdit = (region) => { setForm({ name: region.name, latitude: region.latitude, longitude: region.longitude, description: region.description || '' }); setMapPos([Number(region.latitude), Number(region.longitude)]); setEditing(region); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Hapus wilayah ini?')) return; await api.delete(`/api/regions/${id}`); loadRegions(); };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Data Wilayah</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ ...btnBase, background: showForm ? '#e74c3c' : '#1a1a2e', color: '#fff' }}><IconPlus /> {showForm ? 'Batal' : 'Tambah Wilayah'}</button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24, border: '1px solid #e8f0fe' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#333' }}>{editing ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <input placeholder="Nama Wilayah" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} required onFocus={e => e.target.style.borderColor = '#4fc3f7'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                <div style={{ display: 'flex', gap: 12 }}>
                  <input placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} style={{ ...inputStyle, flex: 1 }} required onFocus={e => e.target.style.borderColor = '#4fc3f7'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                  <input placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} style={{ ...inputStyle, flex: 1 }} required onFocus={e => e.target.style.borderColor = '#4fc3f7'} onBlur={e => e.target.style.borderColor = '#e0e0e0'} />
                </div>
                <textarea placeholder="Deskripsi (opsional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} />
                <button type="submit" style={{ ...btnBase, background: '#27ae60', color: '#fff', fontSize: 14, padding: '10px 24px' }}>{editing ? 'Perbarui' : 'Simpan'}</button>
              </div>
              <div style={{ flex: 1, minWidth: 320 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><IconLocation /> Klik pada peta untuk memilih koordinat</div>
                <MapPicker position={mapPos} onPositionChange={handleMapClick} height="320px" />
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex' }}><IconSearch /></span>
            <input placeholder="Cari wilayah..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>{filtered.length} dari {regions.length} wilayah</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                <th style={th} onClick={() => handleSort('name')}>Nama <SortIcon dir={sort.key === 'name' ? sort.dir : ''} /></th>
                <th style={th} onClick={() => handleSort('latitude')}>Latitude <SortIcon dir={sort.key === 'latitude' ? sort.dir : ''} /></th>
                <th style={th} onClick={() => handleSort('longitude')}>Longitude <SortIcon dir={sort.key === 'longitude' ? sort.dir : ''} /></th>
                <th style={{ ...th, textAlign: 'right' }} onClick={() => handleSort('total_carbon')}>Total Karbon <SortIcon dir={sort.key === 'total_carbon' ? sort.dir : ''} /></th>
                <th style={{ ...thNoSort, textAlign: 'center' }}>Keparahan</th>
                <th style={{ ...thNoSort, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{r.latitude}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{r.longitude}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Number(r.total_carbon).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{r.latest_severity ? <span style={{ background: severityColor(r.latest_severity), color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.latest_severity}</span> : <span style={{ color: '#bbb' }}>--</span>}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button onClick={() => handleEdit(r)} style={{ ...btnBase, padding: '6px 12px', background: '#eef2ff', color: '#4f46e5', marginRight: 6 }}><IconEdit /> Edit</button>
                    <button onClick={() => handleDelete(r.id)} style={{ ...btnBase, padding: '6px 12px', background: '#fef2f2', color: '#dc2626' }}><IconTrash /> Hapus</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#999' }}>{search ? 'Wilayah tidak ditemukan' : 'Belum ada wilayah. Tambahkan sekarang!'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
