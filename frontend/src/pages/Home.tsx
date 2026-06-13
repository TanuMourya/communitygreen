import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Issue } from '../types';
import IssueMap from '../components/IssueMap';
import Analytics from './Analytics';
import ReportIssue from './ReportIssue';

const CAT_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  'Waste Dumping':      { bg: '#fef9c3', text: '#a16207',  icon: '🗑️' },
  'Water Pollution':    { bg: '#dbeafe', text: '#1d4ed8',  icon: '💧' },
  'Air Quality':        { bg: '#fce7f3', text: '#9d174d',  icon: '💨' },
  'Deforestation':      { bg: '#dcfce7', text: '#15803d',  icon: '🌳' },
  'Noise Pollution':    { bg: '#ede9fe', text: '#6d28d9',  icon: '🔊' },
  'Soil Contamination': { bg: '#ffedd5', text: '#c2410c',  icon: '⚗️' },
  'Other':              { bg: '#f1f5f9', text: '#475569',  icon: '⚠️' },
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  open:        { bg: '#fee2e2', text: '#b91c1c', label: 'Open' },
  resolved:    { bg: '#dcfce7', text: '#15803d', label: 'Resolved' },
  'in-progress': { bg: '#fef9c3', text: '#92400e', label: 'Under review' },
};

const NAV_ITEMS = [
  { id: 'dashboard',  icon: '▦',  label: 'Dashboard' },
  { id: 'feed',       icon: '☰',  label: 'Issue feed' },
  { id: 'map',        icon: '📍', label: 'Live map' },
  { id: 'analytics',  icon: '📊', label: 'Analytics' },
  { id: 'profile',    icon: '👤', label: 'My reports' },
];

const FILTER_CATS = ['All', 'Waste Dumping', 'Water Pollution', 'Air Quality', 'Deforestation', 'Noise Pollution', 'Soil Contamination'];

function Badge({ status }: { status: string }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.open;
  return (
    <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.text, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

function CatIcon({ category, size = 40 }: { category: string; size?: number }) {
  const c = CAT_CONFIG[category] || { bg: '#f1f5f9', text: '#475569', icon: '⚠️' };
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: size * 0.4 }}>
      {c.icon}
    </div>
  );
}

function DetailPanel({ issue, onClose, dark }: { issue: Issue; onClose: () => void; dark: boolean }) {
  const bg = dark ? '#1a2d1e' : '#fff';
  const border = dark ? '#2d4a33' : '#e2e8f0';
  const labelColor = dark ? '#d1fae5' : '#1e293b';
  const subColor = dark ? '#86efac' : '#64748b';

  const getTimeline = (issue: Issue) => {
    const steps = [
      { color: '#16a34a', label: 'Issue reported', sub: `by User #${issue.user_id} · ${new Date(issue.created_at).toLocaleDateString()}`, done: true },
      { color: '#f59e0b', label: `Upvoted ${issue.upvotes} times by community`, sub: 'Community engagement', done: issue.upvotes > 0 },
      { color: '#3b82f6', label: 'Authority assigned for review', sub: 'Under investigation', done: issue.status === 'in-progress' || issue.status === 'resolved' },
      { color: issue.status === 'resolved' ? '#16a34a' : '#d1d5db', label: issue.status === 'resolved' ? 'Issue resolved ✅' : 'Resolution pending...', sub: issue.status === 'resolved' ? 'Marked as resolved' : 'Awaiting action', done: issue.status === 'resolved' },
    ];
    return steps;
  };

  return (
    <aside style={{ width: 300, borderLeft: `0.5px solid ${border}`, background: bg, padding: 20, overflowY: 'auto', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: labelColor }}>Issue detail</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: subColor }}>✕</button>
      </div>

      <CatIcon category={issue.category || 'Other'} size={48} />
      <div style={{ marginTop: 12, marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: labelColor, marginBottom: 6 }}>{issue.title}</div>
        <Badge status={issue.status} />
      </div>
      <p style={{ fontSize: 13, color: subColor, lineHeight: 1.6, marginBottom: 16 }}>{issue.description}</p>

      <div style={{ fontSize: 12, color: subColor, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        <div>📍 {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</div>
        <div>👍 {issue.upvotes} upvotes</div>
        <div>🏷️ {issue.category || 'Uncategorized'}</div>
      </div>

      {/* Activity Timeline */}
      <div style={{ borderTop: `0.5px solid ${border}`, paddingTop: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: subColor, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
          Activity Timeline
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {getTimeline(issue).map((step, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              {/* Line + dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                  background: step.done ? step.color : '#e2e8f0',
                  border: `2px solid ${step.done ? step.color : '#e2e8f0'}`,
                  marginTop: 2
                }} />
                {i < arr.length - 1 && (
                  <div style={{ width: 2, flex: 1, background: step.done ? step.color + '44' : '#e2e8f044', minHeight: 24 }} />
                )}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: step.done ? 600 : 400, color: step.done ? labelColor : subColor }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 11, color: subColor, marginTop: 2 }}>{step.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {issue.photo_url && (
        <img src={`http://localhost:8000${issue.photo_url}`} alt="issue"
          style={{ width: '100%', borderRadius: 10, marginTop: 4, objectFit: 'cover', maxHeight: 160 }} />
      )}
    </aside>
  );
}

export default function Home() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  const isDark = activeNav === 'map';
  const navBg = isDark ? '#1a2d1e' : '#fff';
  const navBorder = isDark ? '#2d4a33' : '#e2e8f0';
  const navLogo = isDark ? '#86efac' : '#1e293b';
  const navLabel = isDark ? '#86efac' : '#64748b';
  const navActive = isDark ? '#f0fdf4' : '#15803d';
  const navActiveBg = isDark ? '#2d4a33' : '#f0fdf4';
  const headerBg = isDark ? '#1a2d1e' : '#fff';
  const headerText = isDark ? '#d1fae5' : '#1e293b';
  const inputBg = isDark ? '#1c2e20' : '#f8fafc';
  const inputBorder = isDark ? '#2d4a33' : '#e2e8f0';
  const mainBg = isDark ? '#0f1a0f' : '#f8fafc';

  const fetchIssues = async () => {
    try {
      const res = await API.get('/issues/');
      setIssues(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
useEffect(() => {
    fetchIssues();
    API.get('/auth/me').then(res => setCurrentUserId(res.data.id)).catch(() => {});
  }, []);

  const handleUpvote = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await API.post(`/issues/${id}/upvote`); fetchIssues(); }
    catch (err) { console.error(err); }
  };
 const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await API.delete(`/issues/${id}`);
      fetchIssues();
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      console.error(err);
    }
  };
  const filtered = issues
    .filter(i => filterCat === 'All' || i.category === filterCat)
    .filter(i => filterStatus === 'All' || i.status === filterStatus)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()));

  const total = issues.length;
  const open = issues.filter(i => i.status === 'open').length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const review = issues.filter(i => i.status === 'in-progress').length;

  // Dashboard View
  const DashboardView = () => (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, background: mainBg }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: 0 }}>Overview</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>Environmental issues in your area</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total reported', value: total,    color: '#1e293b', bg: '#f8fafc', icon: '📋' },
          { label: 'Open issues',    value: open,     color: '#b91c1c', bg: '#fee2e2', icon: '🔴' },
          { label: 'Under review',   value: review,   color: '#92400e', bg: '#fef9c3', icon: '🕒' },
          { label: 'Resolved',       value: resolved, color: '#15803d', bg: '#dcfce7', icon: '✅' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      
      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ width: 'auto', marginTop: 0, padding: '6px 12px', fontSize: 12, borderRadius: 8, background: '#fff', border: '0.5px solid #e2e8f0', color: '#374151' }}>
          {['All', 'open', 'in-progress', 'resolved'].map(s => <option key={s}>{s}</option>)}
        </select>
        {FILTER_CATS.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            background: filterCat === cat ? '#16a34a' : '#fff',
            color: filterCat === cat ? 'white' : '#64748b',
            border: `0.5px solid ${filterCat === cat ? '#16a34a' : '#e2e8f0'}`,
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>{cat}</button>
        ))}
      </div>

      {/* Issues list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.map(issue => (
          <div key={issue.id} onClick={() => setSelected(issue)} style={{
            background: '#fff', borderRadius: 10, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 14,
            border: `0.5px solid ${selected?.id === issue.id ? '#16a34a' : '#e2e8f0'}`,
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            <CatIcon category={issue.category || 'Other'} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{issue.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                {issue.category || 'Uncategorized'} · 👍 {issue.upvotes} votes · 📍 {issue.latitude.toFixed(2)}, {issue.longitude.toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={e => handleUpvote(issue.id, e)} style={{
                background: '#f0fdf4', color: '#16a34a', border: '0.5px solid #dcfce7',
                padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600
              }}>👍 {issue.upvotes}</button>
              <Badge status={issue.status} />
              {currentUserId === issue.user_id && (
                <button onClick={e => handleDelete(issue.id, e)} style={{
                  background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fecaca',
                  padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600
                }}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Feed View
  const FeedView = () => (
    <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
      <div style={{ background: '#fff', padding: '14px 20px', borderBottom: '0.5px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {FILTER_CATS.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} style={{
              background: filterCat === cat ? '#16a34a' : '#fff',
              color: filterCat === cat ? 'white' : '#374151',
              border: `0.5px solid ${filterCat === cat ? '#16a34a' : '#e2e8f0'}`,
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'
            }}>{cat}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>NEAR YOU</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(issue => (
            <div key={issue.id} onClick={() => setSelected(issue)} style={{
              background: '#fff', borderRadius: 14, padding: '14px 16px',
              border: `0.5px solid ${selected?.id === issue.id ? '#16a34a' : '#f0f0f0'}`,
              display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              <CatIcon category={issue.category || 'Other'} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{issue.title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                  📍 {issue.latitude.toFixed(2)} · 👍 {issue.upvotes} · {new Date(issue.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <Badge status={issue.status} />
                <button onClick={e => handleUpvote(issue.id, e)} style={{
                  background: '#f0fdf4', color: '#16a34a', border: '0.5px solid #dcfce7',
                  padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600
                }}>👍</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Map View
  const MapView = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f1a0f' }}>
      <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #2d4a33', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_CATS.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            background: filterCat === cat ? '#16a34a' : '#1c2e20',
            color: filterCat === cat ? 'white' : '#4ade80',
            border: `0.5px solid ${filterCat === cat ? '#16a34a' : '#2d4a33'}`,
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600
          }}>{cat}</button>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <IssueMap issues={filtered} />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', fontFamily: 'Inter, system-ui, sans-serif', overflow: 'hidden' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, background: navBg,
        borderRight: `0.5px solid ${navBorder}`,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.2s ease', overflow: 'hidden', flexShrink: 0, zIndex: 10
      }}>
        <div style={{ padding: '18px 14px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `0.5px solid ${navBorder}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🌱</div>
          {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 600, color: navLogo, whiteSpace: 'nowrap' }}>CommunityGreen</span>}
        </div>

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setActiveNav(item.id); setSelected(null); }} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeNav === item.id ? navActiveBg : 'transparent',
              color: activeNav === item.id ? navActive : navLabel,
              fontWeight: activeNav === item.id ? 600 : 400,
              fontSize: 13, textAlign: 'left', whiteSpace: 'nowrap', transition: 'background 0.15s'
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 14px', borderTop: `0.5px solid ${navBorder}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? '#2d4a33' : '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: isDark ? '#86efac' : '#15803d', flexShrink: 0 }}>
            X
          </div>
          {sidebarOpen && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#d1fae5' : '#1e293b' }}>Xman</div>
              <div style={{ fontSize: 11, color: isDark ? '#4ade80' : '#94a3b8' }}>Community member</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <header style={{ background: headerBg, borderBottom: `0.5px solid ${navBorder}`, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: isDark ? '#86efac' : '#64748b', fontSize: 18 }}>
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: inputBg, border: `0.5px solid ${inputBorder}`, borderRadius: 8, padding: '6px 12px', flex: 1, maxWidth: 340 }}>
            <span style={{ color: isDark ? '#4ade80' : '#94a3b8', fontSize: 14 }}>🔍</span>
            <input placeholder="Search issues..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, color: headerText, width: '100%', margin: 0, padding: 0 }} />
          </div>

          {/* View switcher */}
          <div style={{ display: 'flex', gap: 4, background: inputBg, border: `0.5px solid ${inputBorder}`, borderRadius: 10, padding: 4 }}>
            {[
              { id: 'dashboard', label: '▦' },
              { id: 'feed',      label: '☰' },
              { id: 'map',       label: '📍' },
            ].map(v => (
              <button key={v.id} onClick={() => { setActiveNav(v.id); setSelected(null); }} style={{
                padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: activeNav === v.id ? '#16a34a' : 'transparent',
                color: activeNav === v.id ? '#fff' : isDark ? '#4ade80' : '#94a3b8',
                fontSize: 14, transition: 'all 0.15s'
              }}>{v.label}</button>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => { setActiveNav('report'); setSelected(null); }} style={{
              background: '#16a34a', color: '#fff', border: 'none',
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
              fontSize: 13, fontWeight: 600
            }}>+ Report</button>
            <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} style={{
              background: 'none', border: `0.5px solid ${navBorder}`,
              borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
              color: isDark ? '#86efac' : '#64748b', fontSize: 12
            }}>Sign out</button>
          </div>
        </header>

        {/* Content + Detail panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94a3b8', background: mainBg }}>
              <div style={{ fontSize: 40 }}>🌿</div>
              <span style={{ fontSize: 14 }}>Loading issues...</span>
            </div>
          ) : activeNav === 'dashboard' ? <DashboardView /> :
             activeNav === 'feed' ? <FeedView /> :
             activeNav === 'map' ? <MapView /> :
             activeNav === 'analytics' ? <Analytics /> :
             activeNav === 'report' ? <ReportIssue onSuccess={() => { setActiveNav('dashboard'); fetchIssues(); }} /> :
             activeNav === 'profile' ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94a3b8', background: mainBg }}
                onClick={() => navigate('/profile')}>
                <div style={{ fontSize: 40 }}>👤</div>
                <span style={{ fontSize: 14, cursor: 'pointer', color: '#16a34a', textDecoration: 'underline' }}>Go to your profile →</span>
              </div>
             ) : null}

          {selected && (
            <DetailPanel issue={selected} onClose={() => setSelected(null)} dark={isDark} />
          )}
        </div>
      </div>
    </div>
  );
}