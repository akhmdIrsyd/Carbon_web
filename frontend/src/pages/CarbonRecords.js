import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconCalendar, IconNote, IconCo2, IconLocation, IconCheck } from '../components/Icons';

const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'block', outline: 'none', transition: 'border-color 0.15s' };
const selectStyle = { ...inputStyle };
const card = { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' };
const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' };
const th = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' };
const thNoSort = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12 };

function SortIcon({ dir }) { return <span style={{ fontSize: 10, marginLeft: 4, opacity: dir ? 1 : 0.3 }}>{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>; }

const severityColors = { Aman: '#27ae60', Waspada: '#f39c12', Siaga: '#e67e22', Berbahaya: '#e74c3c', 'Sangat Berbahaya': '#8e44ad' };
const severityMeta = { Aman: { label: 'Aman', desc: 'Karbon rendah, lingkungan sehat' }, Waspada: { label: 'Waspada', desc: 'Karbon mulai meningkat, perlu pemantauan' }, Siaga: { label: 'Siaga', desc: 'Karbon cukup tinggi, waspada dampak lingkungan' }, Berbahaya: { label: 'Berbahaya', desc: 'Karbon tinggi, berbahaya bagi kesehatan' }, 'Sangat Berbahaya': { label: 'Sangat Berbahaya', desc: 'Karbon sangat tinggi, kondisi darurat!' } };

export default function CarbonRecords() {
  const [records, setRecords] = useState([]);
  const [regions, setRegions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [severityResult, setSeverityResult] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: '', dir: '' });
  const [form, setForm] = useState({ region_id: '', carbon_amount: '', recorded_at: '', notes: '' });

  const loadData = () => { api.get('/api/regions').then((r) => setRegions(r.data)); api.get('/api/carbon', { params: filter ? { region_id: filter } : {} }).then((r) => setRecords(r.data)); };
  useEffect(() => { loadData(); }, [filter]);

  const filtered = useMemo(() => {
    let f = records;
    if (search) { const q = search.toLowerCase(); f = f.filter((r) => r.region_name?.toLowerCase().includes(q) || r.notes?.toLowerCase().includes(q) || r.severity?.toLowerCase().includes(q)); }
    if (!sort.key) return f;
    return [...f].sort((a, b) => {
      let va = a[sort.key], vb = b[sort.key];
      if (sort.key === 'recorded_at' || sort.key === 'carbon_amount') { va = Number(va) || 0; vb = Number(vb) || 0; }
      else if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va == null) va = ''; if (vb == null) vb = '';
      if (sort.key === 'region_name') { va = (a.region_name || '').toLowerCase(); vb = (b.region_name || '').toLowerCase(); }
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, search, sort]);

  const handleSort = (key) => setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const resetForm = () => { setForm({ region_id: '', carbon_amount: '', recorded_at: '', notes: '' }); setSeverityResult(null); setEditing(null); setShowForm(false); };
  const handleCarbonChange = (value) => {
    setForm({ ...form, carbon_amount: value });
    if (value && !isNaN(value)) { const num = Number(value); let sev = num <= 100 ? 'Aman' : num <= 300 ? 'Waspada' : num <= 500 ? 'Siaga' : num <= 700 ? 'Berbahaya' : 'Sangat Berbahaya'; setSeverityResult(sev); }
    else setSeverityResult(null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) await api.put(`/api/carbon/${editing.id}`, form); else await api.post('/api/carbon', form); resetForm(); loadData(); } catch (err) { alert(err.response?.data?.message || 'Error saving record'); }
  };
  const handleEdit = (rec) => { setForm({ region_id: rec.region_id, carbon_amount: rec.carbon_amount, recorded_at: rec.recorded_at.split('T')[0], notes: rec.notes || '' }); setSeverityResult(rec.severity); setEditing(rec); setShowForm(true); };
  const handleDelete = async (id) => { if (!window.confirm('Hapus record ini?')) return; await api.delete(`/api/carbon/${id}`); loadData(); };
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>Data Karbon</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ ...selectStyle, marginBottom: 0, width: 180 }}><option value="">Semua Wilayah</option>{regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={{ ...btnBase, background: showForm ? '#e74c3c' : '#1a1a2e', color: '#fff' }}><IconPlus /> {showForm ? 'Batal' : 'Tambah Record'}</button>
        </div>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24, border: '1px solid #e8f0fe' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#333' }}>{editing ? 'Edit Record Karbon' : 'Tambah Record Karbon Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <select value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} style={selectStyle} required><option value="">Pilih Wilayah</option>{regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                <input type="number" step="0.01" placeholder="Jumlah Karbon (ppm)" value={form.carbon_amount} onChange={(e) => handleCarbonChange(e.target.value)} style={inputStyle} required />
                {severityResult && (
                  <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, background: severityColors[severityResult] + '12', border: `1px solid ${severityColors[severityResult]}40` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: severityColors[severityResult], display: 'inline-block' }} /><span style={{ fontWeight: 700, fontSize: 15, color: severityColors[severityResult] }}>{severityMeta[severityResult]?.label}</span></div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4, marginLeft: 18 }}>{severityMeta[severityResult]?.desc}</div>
                  </div>
                )}
                <div style={{ position: 'relative', marginBottom: 14 }}><span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex', pointerEvents: 'none' }}><IconCalendar /></span><input type="date" value={form.recorded_at} max={today} onChange={(e) => setForm({ ...form, recorded_at: e.target.value })} style={{ ...inputStyle, paddingLeft: 36, marginBottom: 0 }} required /></div>
                <div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: 12, top: 14, color: '#aaa', display: 'flex', pointerEvents: 'none' }}><IconNote /></span><textarea placeholder="Catatan (opsional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, paddingLeft: 36, minHeight: 60, resize: 'vertical', marginBottom: 0 }} /></div>
                <div style={{ marginTop: 14 }}><button type="submit" style={{ ...btnBase, background: '#27ae60', color: '#fff', fontSize: 14, padding: '10px 24px' }}><IconCheck /> {editing ? 'Perbarui' : 'Simpan'}</button></div>
              </div>
            </div>
          </form>
        </div>
      )}

      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}><span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa', display: 'flex' }}><IconSearch /></span><input placeholder="Cari wilayah, catatan, atau keparahan..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none' }} /></div>
          <div style={{ fontSize: 13, color: '#888' }}>{filtered.length} dari {records.length} records</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                <th style={th} onClick={() => handleSort('region_name')}>Wilayah <SortIcon dir={sort.key === 'region_name' ? sort.dir : ''} /></th>
                <th style={{ ...th, textAlign: 'right' }} onClick={() => handleSort('carbon_amount')}>Karbon (ppm) <SortIcon dir={sort.key === 'carbon_amount' ? sort.dir : ''} /></th>
                <th style={{ ...thNoSort, textAlign: 'center' }}>Keparahan</th>
                <th style={{ ...th, textAlign: 'center' }} onClick={() => handleSort('recorded_at')}>Tanggal <SortIcon dir={sort.key === 'recorded_at' ? sort.dir : ''} /></th>
                <th style={{ ...thNoSort, textAlign: 'left' }}>Catatan</th>
                <th style={{ ...thNoSort, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconLocation /> {r.region_name}</span></td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Number(r.carbon_amount).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ background: severityColors[r.severity] || '#ccc', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.severity}</span></td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{new Date(r.recorded_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td style={{ padding: '10px 12px', color: r.notes ? '#555' : '#ccc', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '-'}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <button onClick={() => handleEdit(r)} style={{ ...btnBase, padding: '6px 12px', background: '#eef2ff', color: '#4f46e5', marginRight: 6 }}><IconEdit /> Edit</button>
                    <button onClick={() => handleDelete(r.id)} style={{ ...btnBase, padding: '6px 12px', background: '#fef2f2', color: '#dc2626' }}><IconTrash /> Hapus</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: 'center', color: '#999' }}>{search ? 'Record tidak ditemukan' : 'Belum ada data karbon'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
