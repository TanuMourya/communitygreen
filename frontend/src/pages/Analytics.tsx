import React, { useEffect, useState } from 'react';
import API from '../api';
import { Issue } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/issues/').then(res => {
      setIssues(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#94a3b8' }}>
      <div style={{ fontSize: 40 }}>📊</div>
      <span>Loading analytics...</span>
    </div>
  );

  // Category breakdown
  const categoryData = Object.entries(
    issues.reduce((acc, i) => {
      const cat = i.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Status breakdown
  const statusData = [
    { name: 'Open',        value: issues.filter(i => i.status === 'open').length,        color: '#ef4444' },
    { name: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Resolved',    value: issues.filter(i => i.status === 'resolved').length,    color: '#16a34a' },
  ];

  // Monthly trend
  const monthlyData = Object.entries(
    issues.reduce((acc, i) => {
      const month = new Date(i.created_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([month, count]) => ({ month, count }));

  // Severity breakdown
  const severityData = [
    { name: 'Low',    value: issues.filter(i => i.severity === 'low').length,    color: '#16a34a' },
    { name: 'Medium', value: issues.filter(i => i.severity === 'medium').length, color: '#f59e0b' },
    { name: 'High',   value: issues.filter(i => i.severity === 'high').length,   color: '#ef4444' },
  ];

  // Top upvoted
  const topIssues = [...issues].sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);

  const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes, 0);
  const resolvedRate = issues.length > 0 ? Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100) : 0;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#f8fafc' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Analytics</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Insights on environmental issues in your community</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Issues',    value: issues.length,  icon: '📋', color: '#1e293b', bg: '#f8fafc' },
          { label: 'Total Upvotes',   value: totalUpvotes,   icon: '👍', color: '#1d4ed8', bg: '#dbeafe' },
          { label: 'Resolution Rate', value: `${resolvedRate}%`, icon: '✅', color: '#15803d', bg: '#dcfce7' },
          { label: 'High Severity',   value: issues.filter(i => i.severity === 'high').length, icon: '🔴', color: '#b91c1c', bg: '#fee2e2' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Category bar chart */}
        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Issues by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '0.5px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie chart */}
        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Issues by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '0.5px solid #e2e8f0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Monthly trend */}
        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '0.5px solid #e2e8f0', fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity breakdown */}
        <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '0.5px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top upvoted issues */}
      <div style={{ background: '#fff', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>🏆 Top Upvoted Issues</h3>
        {topIssues.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 13 }}>No issues yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topIssues.map((issue, index) => (
              <div key={issue.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '0.5px solid #e2e8f0' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: index === 0 ? '#fef9c3' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: index === 0 ? '#a16207' : '#64748b', flexShrink: 0 }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{issue.title}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{issue.category || 'Uncategorized'} · {issue.status}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 700, border: '0.5px solid #dcfce7' }}>
                  👍 {issue.upvotes}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}