import React, { useState } from 'react';
import API from '../api';

const CATEGORIES = ['Water Pollution', 'Air Quality', 'Waste Dumping', 'Deforestation', 'Noise Pollution', 'Soil Contamination', 'Other'];
const SEVERITIES = ['low', 'medium', 'high'];

interface Duplicate {
  id: number;
  title: string;
  description: string;
  status: string;
  similarity_score: number;
}

export default function ReportIssue({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [submitAnyway, setSubmitAnyway] = useState(false);

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
        setLocLoading(false);
      },
      () => { setError('Could not get location'); setLocLoading(false); }
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setPhoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const doSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      if (category) formData.append('category', category);
      if (severity) formData.append('severity', severity);
      if (photo) formData.append('photo', photo);
      await API.post('/issues/', formData);
      if (onSuccess) onSuccess();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If already confirmed by user, just submit
    if (submitAnyway) {
      await doSubmit();
      return;
    }

    // Check duplicates first if location available
    if (latitude && longitude) {
      setCheckingDuplicates(true);
      try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);
        const res = await API.post('/issues/check-duplicate', formData);
        const found = res.data.duplicates;
        setDuplicates(found);
        if (found.length > 0) {
          setShowDuplicateWarning(true);
          setCheckingDuplicates(false);
          return;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingDuplicates(false);
      }
    }

    await doSubmit();
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>📢 Report an Issue</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Help your community by reporting environmental problems</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 16, border: '0.5px solid #fecaca', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Duplicate Warning */}
        {showDuplicateWarning && duplicates.length > 0 && (
          <div style={{ background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>⚠️ Similar issues already reported!</div>
              <button onClick={() => setShowDuplicateWarning(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: 16 }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#92400e', marginBottom: 12 }}>These existing issues look similar. Consider upvoting them instead:</p>
            {duplicates.map(d => (
              <div key={d.id} style={{ background: 'white', borderRadius: 8, padding: '10px 14px', marginBottom: 8, border: '0.5px solid #fcd34d' }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{d.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  {d.description.slice(0, 80)}... · Status: {d.status} ·
                  <span style={{ color: '#16a34a', fontWeight: 600 }}> {Math.round(d.similarity_score * 100)}% similar</span>
                </div>
              </div>
            ))}
            <button onClick={() => { setSubmitAnyway(true); setShowDuplicateWarning(false); doSubmit(); }} style={{
              background: '#16a34a', color: 'white', border: 'none',
              borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', marginTop: 8
            }}>
              Submit anyway →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title */}
          <div style={{ background: 'white', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <label style={{ fontWeight: 600, color: '#374151', fontSize: 13, display: 'block', marginBottom: 6 }}>Issue Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Illegal dumping near river bank" />
          </div>

          {/* Description */}
          <div style={{ background: 'white', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <label style={{ fontWeight: 600, color: '#374151', fontSize: 13, display: 'block', marginBottom: 6 }}>Description *</label>
            <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} required
              placeholder="Describe the issue in detail..." style={{ resize: 'vertical' }} />
          </div>

          {/* Category + Severity */}
          <div style={{ background: 'white', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ fontWeight: 600, color: '#374151', fontSize: 13, display: 'block', marginBottom: 6 }}>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 600, color: '#374151', fontSize: 13, display: 'block', marginBottom: 6 }}>Severity</label>
                <select value={severity} onChange={e => setSeverity(e.target.value)}>
                  {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div style={{ background: 'white', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <label style={{ fontWeight: 600, color: '#374151', fontSize: 13, display: 'block', marginBottom: 6 }}>Location *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} required placeholder="Latitude" style={{ marginTop: 0 }} />
              <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} required placeholder="Longitude" style={{ marginTop: 0 }} />
            </div>
            <button type="button" onClick={getLocation} disabled={locLoading} style={{
              marginTop: 10, background: '#f0fdf4', color: '#16a34a',
              border: '0.5px solid #bbf7d0', padding: '9px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
              {locLoading ? '⏳ Getting location...' : '📍 Use My Current Location'}
            </button>
            {latitude && longitude && (
              <p style={{ marginTop: 6, fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                ✅ {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
              </p>
            )}
          </div>

          {/* Photo */}
          <div style={{ background: 'white', border: '0.5px solid #e2e8f0', borderRadius: 12, padding: 18 }}>
            <label style={{ fontWeight: 600, color: '#374151', fontSize: 13, display: 'block', marginBottom: 10 }}>Photo (optional)</label>
            {preview ? (
              <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
            ) : (
              <div style={{ background: '#f0fdf4', border: '2px dashed #bbf7d0', borderRadius: 10, padding: '24px', textAlign: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>Upload a photo of the issue</p>
              </div>
            )}
            <label htmlFor="photo-input" style={{
              display: 'block', textAlign: 'center', background: '#f0fdf4',
              color: '#16a34a', padding: 10, borderRadius: 8, cursor: 'pointer',
              fontSize: 13, fontWeight: 600, border: '0.5px solid #bbf7d0'
            }}>
              {preview ? '🔄 Change Photo' : '📎 Select Photo'}
            </label>
            <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} id="photo-input" />
          </div>

          <button type="submit" style={{
            background: '#16a34a', color: 'white', border: 'none',
            borderRadius: 10, padding: '13px', fontSize: 15,
            fontWeight: 700, cursor: 'pointer', width: '100%'
          }} disabled={loading || checkingDuplicates}>
            {checkingDuplicates ? '🔍 Checking for duplicates...' : loading ? '⏳ Submitting...' : '🚀 Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}