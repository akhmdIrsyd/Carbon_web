import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import MapView from '../components/MapView';
import { IconMap, IconPie, IconTrend, IconLayer, IconList } from '../components/Icons';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const severityColors = {
  Aman: '#27ae60', Waspada: '#f39c12', Siaga: '#e67e22',
  Berbahaya: '#e74c3c', 'Sangat Berbahaya': '#8e44ad',
};

const container = { padding: '28px 32px', maxWidth: 1440, margin: '0 auto' };
const card = { background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' };
const statBox = (color) => ({ background: '#fff', padding: '20px 24px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)', textAlign: 'center', flex: 1, minWidth: 200, borderLeft: `4px solid ${color}` });
const pageTitle = { fontSize: 24, fontWeight: 700, color: '#1a1a2e', marginBottom: 24 };
const sectionTitle = { fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };
const th = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12, cursor: 'pointer', userSelect: 'none' };
const thNoSort = { padding: '10px 12px', color: '#888', fontWeight: 600, fontSize: 12 };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '1px solid #eee', fontSize: 13 }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: '#333' }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color || '#333' }}>{p.name}: <strong>{Number(p.value).toLocaleString()}</strong></div>
        ))}
      </div>
    );
  }
  return null;
};

const selectStyle = { padding: '8px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#fff', minWidth: 200, outline: 'none', cursor: 'pointer', color: '#333' };

function SortIcon({ dir }) {
  return <span style={{ fontSize: 10, marginLeft: 4, opacity: dir ? 1 : 0.3 }}>{dir === 'asc' ? '\u25B2' : '\u25BC'}</span>;
}

function useSortable(data) {
  const [sort, setSort] = useState({ key: '', dir: '' });
  const sorted = useMemo(() => {
    if (!sort.key || !data) return data;
    const arr = [...data];
    arr.sort((a, b) => {
      let va = a[sort.key], vb = b[sort.key];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
      if (va == null) va = ''; if (vb == null) vb = '';
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, sort]);
  const handleSort = (key) => setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  return { sorted, handleSort, sort };
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [regions, setRegions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats').then((res) => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
    api.get('/api/regions').then((r) => setRegions(r.data));
  }, []);

  useEffect(() => {
    const params = selectedRegion ? { region_id: selectedRegion } : {};
    api.get('/api/dashboard/monthly-history', { params }).then((r) => {
      const parsed = (r.data || []).map((d) => ({ ...d, total: Number(d.total) || 0, avg: Number(d.avg) || 0, count: Number(d.count) || 0 }));
      setMonthlyData(parsed);
    });
  }, [selectedRegion]);

  const { sorted: sortedMonth, handleSort: sortMonth, sort: sortM } = useSortable(stats?.monthRegionSummary);
  const { sorted: sortedAll, handleSort: sortAll, sort: sortA } = useSortable(stats?.regionSummary);

  if (loading) return <div style={{ ...container, textAlign: 'center', paddingTop: 80 }}><div style={{ color: '#888', fontSize: 14 }}>Loading dashboard...</div></div>;
  if (!stats) return <div style={{ ...container, textAlign: 'center', paddingTop: 80 }}><div style={{ color: '#e74c3c', fontSize: 14 }}>Failed to load dashboard</div></div>;

  return (
    <div style={container}>
      <h1 style={pageTitle}>Dashboard Monitoring Karbon</h1>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
        <div style={statBox('#1a1a2e')}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Total Wilayah</div><div style={{ fontSize: 30, fontWeight: 700, color: '#1a1a2e' }}>{stats.totalRegions}</div></div>
        <div style={statBox('#3498db')}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Records Bulan Ini</div><div style={{ fontSize: 30, fontWeight: 700, color: '#3498db' }}>{stats.monthRecords}</div></div>
        <div style={statBox('#e67e22')}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Karbon Bulan Ini</div><div style={{ fontSize: 30, fontWeight: 700, color: '#e67e22' }}>{Number(stats.monthCarbon).toLocaleString()}</div><div style={{ fontSize: 11, color: '#aaa' }}>ppm</div></div>
        <div style={statBox('#27ae60')}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Rata-rata Karbon</div><div style={{ fontSize: 30, fontWeight: 700, color: '#27ae60' }}>{stats.avgCarbon}</div><div style={{ fontSize: 11, color: '#aaa' }}>ppm</div></div>
      </div>

      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={sectionTitle}><IconMap /> Peta Persebaran Karbon</h3>
        <MapView regions={stats.monthRegionSummary} height="420px" />
      </div>

      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={sectionTitle}><IconLayer /> Ringkasan per Wilayah - Bulan Ini</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
              <th style={th} onClick={() => sortMonth('name')}>Wilayah <SortIcon dir={sortM.key === 'name' ? sortM.dir : ''} /></th>
              <th style={{ ...th, textAlign: 'right' }} onClick={() => sortMonth('total_carbon')}>Total Karbon (ppm) <SortIcon dir={sortM.key === 'total_carbon' ? sortM.dir : ''} /></th>
              <th style={{ ...th, textAlign: 'center' }} onClick={() => sortMonth('record_count')}>Records <SortIcon dir={sortM.key === 'record_count' ? sortM.dir : ''} /></th>
              <th style={{ ...thNoSort, textAlign: 'center' }}>Keparahan</th>
            </tr>
          </thead>
          <tbody>
            {sortedMonth.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Number(r.total_carbon).toLocaleString()}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{r.record_count}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {r.latest_severity ? <span style={{ background: severityColors[r.latest_severity] || '#ccc', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-block' }}>{r.latest_severity}</span> : <span style={{ color: '#bbb' }}>--</span>}
                </td>
              </tr>
            ))}
            {sortedMonth.length === 0 && <tr><td colSpan={4} style={{ padding: '40px 12px', textAlign: 'center', color: '#999' }}>Belum ada data bulan ini</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ ...card, flex: 1, minWidth: 320 }}>
          <h3 style={sectionTitle}><IconPie /> Keparahan Wilayah Bulan Ini</h3>
          {stats.severityCounts.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '50px 0', fontSize: 13 }}>Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={stats.severityCounts} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={90} label={({ severity, count }) => `${severity}: ${count}`}>
                  {stats.severityCounts.map((entry) => (<Cell key={entry.severity} fill={severityColors[entry.severity] || '#ccc'} />))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div style={{ ...card, flex: 1, minWidth: 320 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={sectionTitle}><IconTrend /> History Per Bulan</h3>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} style={selectStyle}>
              <option value="">Semua Wilayah</option>
              {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          {monthlyData.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '50px 0', fontSize: 13 }}>Belum ada data</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: 5, bottom: 8 }}>
                  <defs>
                    <linearGradient id="gradM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3498db" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3498db" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={55} domain={[0, (max) => Math.ceil(max / 100) * 100]} tickFormatter={(v) => v >= 1000 ? (v/1000).toFixed(1) + 'k' : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#3498db" fill="url(#gradM)" strokeWidth={2} dot={{ r: 4, fill: '#3498db', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3498db', stroke: '#fff', strokeWidth: 2 }} name="Total Karbon" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...card, marginBottom: 24 }}>
        <h3 style={sectionTitle}><IconList /> 10 Records Terbaru</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
              <th style={thNoSort}>Wilayah</th>
              <th style={{ ...thNoSort, textAlign: 'right' }}>Karbon (ppm)</th>
              <th style={{ ...thNoSort, textAlign: 'center' }}>Keparahan</th>
              <th style={{ ...thNoSort, textAlign: 'center' }}>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentRecords.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{r.region_name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Number(r.carbon_amount).toLocaleString()}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}><span style={{ background: severityColors[r.severity] || '#ccc', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-block' }}>{r.severity}</span></td>
                <td style={{ padding: '10px 12px', textAlign: 'center', color: '#666' }}>{new Date(r.recorded_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
              </tr>
            ))}
            {stats.recentRecords.length === 0 && <tr><td colSpan={4} style={{ padding: '40px 12px', textAlign: 'center', color: '#999' }}>Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={sectionTitle}><IconLayer /> Ringkasan per Wilayah</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
              <th style={th} onClick={() => sortAll('name')}>Wilayah <SortIcon dir={sortA.key === 'name' ? sortA.dir : ''} /></th>
              <th style={{ ...th, textAlign: 'right' }} onClick={() => sortAll('total_carbon')}>Total Karbon <SortIcon dir={sortA.key === 'total_carbon' ? sortA.dir : ''} /></th>
              <th style={{ ...th, textAlign: 'center' }} onClick={() => sortAll('record_count')}>Records <SortIcon dir={sortA.key === 'record_count' ? sortA.dir : ''} /></th>
              <th style={{ ...thNoSort, textAlign: 'center' }}>Keparahan</th>
            </tr>
          </thead>
          <tbody>
            {sortedAll.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }} onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{r.name}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Number(r.total_carbon).toLocaleString()}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{r.record_count}</td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {r.latest_severity ? <span style={{ background: severityColors[r.latest_severity] || '#ccc', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-block' }}>{r.latest_severity}</span> : <span style={{ color: '#bbb' }}>--</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
