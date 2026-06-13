import React, { useEffect, useState } from 'react';
import API from '../api';
import { Issue, User } from '../types';
import IssueCard from '../components/IssueCard';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, issuesRes] = await Promise.all([
          API.get('/auth/me'),
          API.get('/issues/')
        ]);
        setUser(userRes.data);
        setIssues(issuesRes.data.filter((i: Issue) => i.user_id === userRes.data.id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌿</div>
      <p>Loading profile...</p>
    </div>
  );

  const resolved = issues.filter(i => i.status === 'resolved').length;
  const totalUpvotes = issues.reduce((sum, i) => sum + i.upvotes, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8faf8' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #14532d, #16a34a)',
        padding: '40px 32px', color: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: '800', color: 'white', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800' }}>{user?.name}</h1>
            <p style={{ opacity: 0.8, marginTop: '4px' }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
              {[
                { label: 'Issues Reported', value: issues.length, icon: '📋' },
                { label: 'Points Earned', value: user?.points || 0, icon: '⭐' },
                { label: 'Resolved', value: resolved, icon: '✅' },
                { label: 'Total Upvotes', value: totalUpvotes, icon: '👍' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
                  padding: '10px 18px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '800' }}>{stat.icon} {stat.value}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '48px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
          My Reported Issues
        </h2>
        {issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ color: '#374151', marginBottom: '8px' }}>No issues yet</h3>
            <p style={{ color: '#6b7280' }}>Start reporting environmental issues in your community!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {issues.map(issue => <IssueCard key={issue.id} issue={issue} onUpvote={() => {}} />)}
          </div>
        )}
      </div>
    </div>
  );
}