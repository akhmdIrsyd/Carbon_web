import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../api';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconCalendar, IconNote, IconCo2, IconLocation, IconCheck, IconLayer, IconX } from '../components/Icons';

const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, marginBottom: 14, display: 'block', outline: 'none', transition: 'border-color 0.15s' };
const selectStyle = { ...inputStyle };
const card = { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' };
const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' };
const th = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' };
const thNoSort = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12 };

function SortIcon({ dir }) { return <span style={{ fontSize: 10, marginLeft: 4, opacity: dir ? 1 : 0.3 }}>{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>; }

const severityColors = { Aman: '#27ae60', Waspada: '#f39c12', Siaga: '#e67e22', Berbahaya: '#e74c3c', 'Sangat Berbahaya': '#8e44ad' };
const severityMeta = { Aman: { label: 'Aman', desc: 'Karbon rendah, lingkungan sehat' }, Waspada: { label: 'Waspada', desc: 'Karbon mulai meningkat, perlu pemantauan' }, Siaga: { label: 'Siaga', desc: 'Karbon cukup tinggi, waspada dampak lingkungan' }, Berbahaya: { label: 'Berbahaya', desc: 'Karbon tinggi, berbahaya bagi kesehatan' }, 'Sangat Berbahaya': { label: 'Sangat Berbahaya', desc: 'Karbon sangat tinggi, kondisi darurat!' } };

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function MonthPicker({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(value ? parseInt(value.split('-')[0]) : new Date().getFullYear());
  useEffect(() => { if (open && value) setYear(parseInt(value.split('-')[0])); }, [open, value]);

  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d9e6', borderRadius: 10, fontSize: 13, background: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, color: value ? '#1a1a2e' : '#9ca3af', fontFamily: 'inherit', boxSizing: 'border-box' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {value ? `${monthShort[parseInt(value.split('-')[1]) - 1]} ${value.split('-')[0]}` : placeholder || 'Pilih bulan'}
        <svg style={{ marginLeft: 'auto' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 9999, background: '#fff', borderRadius: 14, boxShadow: '0 16px 50px rgba(0,0,0,0.25)', padding: 20, width: 280, border: '1px solid #eef0f4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <button type="button" onClick={() => setYear(year - 1)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>&lsaquo;</button>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#1a1a2e' }}>{year}</span>
            <button type="button" onClick={() => setYear(year + 1)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' }}>&rsaquo;</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {monthShort.map((m, i) => {
              const val = `${year}-${String(i + 1).padStart(2, '0')}`;
              const sel = value === val;
              return (
                <button key={i} type="button" onClick={() => { onChange(val); setOpen(false); }}
                  style={{ padding: '10px 0', borderRadius: 10, cursor: 'pointer', background: sel ? '#4f46e5' : '#f3f4f6', color: sel ? '#fff' : '#374151', fontWeight: sel ? 700 : 500, fontSize: 13, border: 'none' }}>{m}</button>
              );
            })}
          </div>
          <button type="button" onClick={() => setOpen(false)} style={{ width: '100%', marginTop: 10, padding: '8px', border: '1px solid #e0e4e8', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>Tutup</button>
        </div>
      )}
      {open && <div style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }} onClick={() => setOpen(false)} />}
    </div>
  );
}

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
  const [showReport, setShowReport] = useState(false);
  const [reportFilter, setReportFilter] = useState({ region_id: '', periodStart: '', periodEnd: '' });
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const curYear = String(now.getFullYear());

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
          <button onClick={() => { setShowReport(true); setReportData(null); setReportFilter({ region_id: '', periodStart: '', periodEnd: '' }); }} style={{ ...btnBase, background: '#4f46e5', color: '#fff' }}><IconLayer /> Laporan</button>
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

      {showReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 1200, width: '100%', maxHeight: '95vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid #eef0f4' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}><IconLayer /> Laporan Detail Karbon</h2>
              <button onClick={() => setShowReport(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#888', padding: 4 }}><IconX /></button>
            </div>
            <div style={{ padding: '24px 28px', overflow: 'auto', flex: 1 }}>
              <div style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f3ff 100%)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, border: '1px solid #e4e9f2' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 14, alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}><IconLocation /> Wilayah</label>
                    <select value={reportFilter.region_id} onChange={(e) => setReportFilter({ ...reportFilter, region_id: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d9e6', borderRadius: 10, fontSize: 13, fontWeight: 500, background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">Semua Wilayah</option>
                      {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Dari Bulan</label>
                    <MonthPicker value={reportFilter.periodStart} onChange={(v) => setReportFilter({ ...reportFilter, periodStart: v })} placeholder="Pilih" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#4b5563', marginBottom: 6 }}>Sampai Bulan</label>
                    <MonthPicker value={reportFilter.periodEnd} onChange={(v) => setReportFilter({ ...reportFilter, periodEnd: v })} placeholder="Pilih" />
                  </div>
                  <div>
                    <button disabled={reportLoading} onClick={async () => {
                      setReportLoading(true); setReportData(null);
                      try {
                        const params = {};
                        if (reportFilter.region_id) params.region_id = reportFilter.region_id;
                        if (reportFilter.periodStart) params.month_start = reportFilter.periodStart;
                        if (reportFilter.periodEnd) params.month_end = reportFilter.periodEnd;
                        const r = await api.get('/api/carbon/report/data', { params }); setReportData(r.data);
                      } catch (err) { alert(err.response?.data?.message || 'Gagal memuat laporan'); }
                      setReportLoading(false);
                    }} style={{
                      ...btnBase, background: '#1a1a2e', color: '#fff',
                      padding: '10px 22px', fontSize: 13, borderRadius: 10,
                      opacity: reportLoading ? 0.6 : 1, width: '100%', justifyContent: 'center',
                    }}>
                      {reportLoading ? 'Memuat...' : 'Tampilkan'}
                    </button>
                  </div>
                </div>
              </div>

              {reportData && reportData.records.length > 0 && (
                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                  <button onClick={() => {
                    const w = window.open('', '_blank');
                    const rows = reportData.records.map((r, i) =>
                      `<tr${i % 2 === 0 ? ' style="background:#f9f9f9"' : ''}>
                        <td style="padding:6px 10px;text-align:center">${i + 1}</td>
                        <td style="padding:6px 10px;text-align:right">${Number(r.carbon_amount).toLocaleString()}</td>
                        <td style="padding:6px 10px;text-align:center"><span style="display:inline-block;padding:1px 10px;border-radius:10px;font-size:11px;font-weight:600;color:#fff;background:${severityColors[r.severity] || '#ccc'}">${r.severity}</span></td>
                        <td style="padding:6px 10px;text-align:center">${new Date(r.recorded_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td style="padding:6px 10px">${r.notes || '-'}</td>
                      </tr>`
                    ).join('');
                    const regionLabel = reportFilter.region_id ? reportData.region_name : 'Semua Wilayah';
                    const periodLabel = reportFilter.periodStart || reportFilter.periodEnd ? `${reportFilter.periodStart ? `${monthNames[parseInt(reportFilter.periodStart.split('-')[1])]} ${reportFilter.periodStart.split('-')[0]}` : '...'} - ${reportFilter.periodEnd ? `${monthNames[parseInt(reportFilter.periodEnd.split('-')[1])]} ${reportFilter.periodEnd.split('-')[0]}` : '...'}` : 'Semua Periode';
                    w.document.write(`
                      <html><head><title>Laporan Karbon - ${regionLabel}</title>
                      <style>
                        body { font-family: 'Segoe UI',Arial,sans-serif; margin: 30px; color: #222; font-size: 13px; }
                        h1 { font-size: 20px; margin: 0 0 4px; }
                        .sub { color: #666; margin-bottom: 20px; font-size: 13px; }
                        .cards { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
                        .card { background: #f5f5f5; border-radius: 8px; padding: 12px 16px; min-width: 120px; flex: 1; }
                        .card label { font-size: 11px; color: #888; display: block; margin-bottom: 2px; }
                        .card .val { font-size: 18px; font-weight: 700; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                        th { padding: 8px 10px; text-align: left; font-size: 12px; color: #555; border-bottom: 2px solid #ddd; }
                        td { padding: 6px 10px; border-bottom: 1px solid #eee; }
                        @media print { body { margin: 15px; } .no-print { display: none; } }
                      </style></head><body>
                        <h1>Laporan Detail Karbon</h1>
                        <div class="sub">${regionLabel} — ${periodLabel}</div>
                        <div class="cards">
                          <div class="card"><label>Total Record</label><div class="val">${reportData.summary.totalRecords}</div></div>
                          <div class="card"><label>Total Karbon</label><div class="val">${Number(reportData.summary.totalCarbon).toLocaleString()} ppm</div></div>
                          <div class="card"><label>Rata-rata</label><div class="val">${Number(reportData.summary.avgCarbon).toLocaleString()} ppm</div></div>
                          <div class="card"><label>Maksimum</label><div class="val">${reportData.summary.maxCarbon} ppm</div></div>
                          <div class="card"><label>Minimum</label><div class="val">${reportData.summary.minCarbon} ppm</div></div>
                        </div>
                        <table>
                          <thead><tr><th>#</th><th style="text-align:right">Karbon (ppm)</th><th style="text-align:center">Keparahan</th><th style="text-align:center">Tanggal</th><th style="text-align:left">Catatan</th></tr></thead>
                          <tbody>${rows}</tbody>
                        </table>
                        <p style="text-align:center;color:#aaa;margin-top:30px;font-size:11px" class="no-print">Laporan ini digenerate dari Sistem Monitoring Karbon</p>
                        <script>window.print();window.onafterprint=()=>window.close();<\/script>
                      </body></html>
                    `);
                    w.document.close();
                  }} style={{ ...btnBase, background: '#1a1a2e', color: '#fff' }}>Cetak Laporan</button>
                </div>
              )}

              {reportData && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px' }}><div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Total Record</div><div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{reportData.summary.totalRecords}</div></div>
                    <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px' }}><div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Total Karbon</div><div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{Number(reportData.summary.totalCarbon).toLocaleString()} ppm</div></div>
                    <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px' }}><div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Rata-rata</div><div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e' }}>{Number(reportData.summary.avgCarbon).toLocaleString()} ppm</div></div>
                    <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px' }}><div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Maksimum</div><div style={{ fontSize: 20, fontWeight: 700, color: '#e74c3c' }}>{reportData.summary.maxCarbon} ppm</div></div>
                    <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px 16px' }}><div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Minimum</div><div style={{ fontSize: 20, fontWeight: 700, color: '#27ae60' }}>{reportData.summary.minCarbon} ppm</div></div>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: '0 0 12px' }}>Detail Record — {reportFilter.region_id ? reportData.region_name : 'Semua Wilayah'} — {reportFilter.periodStart || reportFilter.periodEnd ? `${reportFilter.periodStart ? `${monthNames[parseInt(reportFilter.periodStart.split('-')[1])]} ${reportFilter.periodStart.split('-')[0]}` : '...'} - ${reportFilter.periodEnd ? `${monthNames[parseInt(reportFilter.periodEnd.split('-')[1])]} ${reportFilter.periodEnd.split('-')[0]}` : '...'}` : 'Semua Periode'}</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                          <th style={{ ...thNoSort, textAlign: 'left' }}>#</th>
                          <th style={{ ...thNoSort, textAlign: 'right' }}>Karbon (ppm)</th>
                          <th style={{ ...thNoSort, textAlign: 'center' }}>Keparahan</th>
                          <th style={{ ...thNoSort, textAlign: 'center' }}>Tanggal</th>
                          <th style={{ ...thNoSort, textAlign: 'left' }}>Catatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.records.map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                            <td style={{ padding: '8px 12px', color: '#888' }}>{i + 1}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Number(r.carbon_amount).toLocaleString()}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center' }}><span style={{ background: severityColors[r.severity] || '#ccc', color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{r.severity}</span></td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#666' }}>{new Date(r.recorded_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td style={{ padding: '8px 12px', color: r.notes ? '#555' : '#ccc' }}>{r.notes || '-'}</td>
                          </tr>
                        ))}
                        {reportData.records.length === 0 && <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#999' }}>Tidak ada data untuk periode ini</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
