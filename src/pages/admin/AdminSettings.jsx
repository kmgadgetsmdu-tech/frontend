import { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    CompanyName: 'KM Gadgets',
    CompanySubtitle: 'Premium Gadgets for Everyone',
    LogoData: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
      if (res.data.LogoData) {
        setLogoPreview(res.data.LogoData);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  }

  function handleNameChange(e) {
    setSettings({ ...settings, CompanyName: e.target.value });
  }

  function handleSubtitleChange(e) {
    setSettings({ ...settings, CompanySubtitle: e.target.value });
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setSettings({ ...settings, LogoData: base64 });
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/settings', {
        CompanyName: settings.CompanyName,
        CompanySubtitle: settings.CompanySubtitle,
        LogoData: settings.LogoData
      });
      
      if (res.data.success) {
        setMessage('✅ Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('❌ Failed to save settings');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>⚙️ Company Settings</h1>
        <p>Manage your company logo, name, and subtitle</p>
      </div>

      <div className="admin-form-container">
        <div className="form-section">
          <h3>Company Logo</h3>
          <div className="logo-upload-area">
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '200px', maxHeight: '100px' }} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ marginTop: '10px' }}
            />
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              Recommended size: 120x60px (PNG or JPG)
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3>Company Name</h3>
          <input
            type="text"
            value={settings.CompanyName}
            onChange={handleNameChange}
            className="form-input"
            placeholder="e.g., KM Gadgets"
          />
        </div>

        <div className="form-section">
          <h3>Tagline / Subtitle</h3>
          <input
            type="text"
            value={settings.CompanySubtitle}
            onChange={handleSubtitleChange}
            className="form-input"
            placeholder="e.g., Premium Gadgets for Everyone"
          />
        </div>

        {message && (
          <div className="message" style={{
            padding: '12px 16px',
            marginTop: '16px',
            borderRadius: '8px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="btn-primary"
          style={{ marginTop: '20px' }}
        >
          {loading ? '💾 Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </div>
  );
}
