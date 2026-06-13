import React from 'react';
import { Issue } from '../types';

interface Props {
  issue: Issue;
  onUpvote: (id: number) => void;
}

const severityConfig: Record<string, { color: string; bg: string; label: string; border: string }> = {
  low:    { color: '#16a34a', bg: '#f0fdf4', label: '🟢 Low', border: '#bbf7d0' },
  medium: { color: '#d97706', bg: '#fffbeb', label: '🟠 Medium', border: '#fde68a' },
  high:   { color: '#dc2626', bg: '#fef2f2', label: '🔴 High', border: '#fecaca' },
};

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  'open':        { color: '#dc2626', bg: '#fef2f2', dot: '#dc2626' },
  'in-progress': { color: '#d97706', bg: '#fffbeb', dot: '#d97706' },
  'resolved':    { color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
};

export default function IssueCard({ issue, onUpvote }: Props) {
  const sev = severityConfig[issue.severity] || severityConfig.medium;
  const sta = statusConfig[issue.status] || statusConfig.open;
  const date = new Date(issue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0', padding: '0', overflow: 'hidden' }}>
      {issue.photo_url ? (
        <img
          src={`http://localhost:8000${issue.photo_url}`}
          alt={issue.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '80px',
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px'
        }}>
          {issue.category === 'Water Pollution' ? '💧' :
           issue.category === 'Air Quality' ? '💨' :
           issue.category === 'Waste Dumping' ? '🗑️' :
           issue.category === 'Deforestation' ? '🌳' : '🌍'}
        </div>
      )}

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{ color: '#111827', fontSize: '15px', fontWeight: '700', lineHeight: '1.4' }}>{issue.title}</h3>
          <span style={{
            background: sta.bg, color: sta.color, border: `1px solid ${sta.bg}`,
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
            fontWeight: '700', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            {issue.status}
          </span>
        </div>

        <p style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6', margin: '0' }}>
          {issue.description.length > 100 ? issue.description.slice(0, 100) + '...' : issue.description}
        </p>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {issue.category && (
            <span style={{
              background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe',
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
            }}>
              {issue.category}
            </span>
          )}
          <span style={{
            background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600'
          }}>
            {sev.label} severity
          </span>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          paddingTop: '12px', borderTop: '1px solid #f3f4f6'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>📍 {issue.latitude.toFixed(2)}, {issue.longitude.toFixed(2)}</span>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>🕒 {date}</span>
          </div>
          <button onClick={() => onUpvote(issue.id)} style={{
            background: issue.upvotes > 0 ? '#f0fdf4' : '#f9fafb',
            color: issue.upvotes > 0 ? '#16a34a' : '#374151',
            border: `1px solid ${issue.upvotes > 0 ? '#bbf7d0' : '#e5e7eb'}`,
            padding: '7px 16px', borderRadius: '20px', fontSize: '13px',
            fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.2s'
          }}>
            👍 {issue.upvotes}
          </button>
        </div>
      </div>
    </div>
  );
}