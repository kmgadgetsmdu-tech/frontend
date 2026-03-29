import { useEffect, useState } from 'react';
import api from '../../api/axios';
import EmojiPicker from '../../components/EmojiPicker';

const ANIM_OPTS  = ['none','fade','slide-up','zoom'];

// All keys lowercase to match the API response shape
const BLANK_CH = { icon:'⚡', iconType:'emoji', anim:'none', orb1:'rgba(14,165,233,0.35)', orb2:'rgba(99,102,241,0.25)', headline:'', para:'', active:true };

export default function AdminStory() {
  const [story,    setStory]    = useState({ enabled: true, chapters: [] });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    api.get('/story').then(r => setStory(r.data)).finally(() => setLoading(false));
  }, []);

  const upStory = (k, v) => setStory(s => ({ ...s, [k]: v }));

  function upChapter(i, k, v) {
    setStory(s => {
      const chs = [...s.chapters];
      chs[i] = { ...chs[i], [k]: v };
      return { ...s, chapters: chs };
    });
  }

  function addChapter() {
    setStory(s => ({ ...s, chapters: [...s.chapters, { ...BLANK_CH }] }));
  }

  function removeChapter(i) {
    setStory(s => ({ ...s, chapters: s.chapters.filter((_, x) => x !== i) }));
  }

  function moveChapter(i, dir) {
    setStory(s => {
      const chs = [...s.chapters];
      const j = i + dir;
      if (j < 0 || j >= chs.length) return s;
      [chs[i], chs[j]] = [chs[j], chs[i]];
      return { ...s, chapters: chs };
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const r = await api.put('/story', story);
      setStory(r.data);  // PUT now returns full story object
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ textAlign:'center', padding:'60px', color:'var(--text-dim)' }}>Loading…</div>;

  return (
    <div>
      <div className="admin-page-header" style={{ alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 className="admin-title">Why Story</h1>
          <p className="admin-subtitle">Scroll-based animated storytelling section on homepage</p>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
          {/* Enabled toggle — uses lowercase 'enabled' key */}
          <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', background:'var(--card)', padding:'10px 16px', borderRadius:10, border:'1px solid var(--card-border)', userSelect:'none' }}>
            <div style={{ position:'relative', width:44, height:24 }}>
              <input type="checkbox" checked={!!story.enabled} onChange={e => upStory('enabled', e.target.checked)} style={{ opacity:0, position:'absolute', inset:0, cursor:'pointer', zIndex:1 }} />
              <div style={{ position:'absolute', inset:0, borderRadius:12, background: story.enabled ? 'var(--accent)' : 'var(--card-border)', transition:'background .2s' }} />
              <div style={{ position:'absolute', top:2, left: story.enabled ? 22 : 2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.3)' }} />
            </div>
            <span style={{ fontSize:'0.88rem', fontWeight:600 }}>{story.enabled ? 'Enabled' : 'Disabled'}</span>
          </label>
          <button onClick={addChapter} className="btn btn-ghost">+ Add Chapter</button>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : '💾 Save Story'}</button>
        </div>
      </div>

      {story.chapters.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px', color:'var(--text-dim)' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📖</div>
          <p>No chapters yet. Add your first chapter!</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {story.chapters.map((ch, i) => (
            <div key={i} style={{ background:'var(--card)', borderRadius:14, border:'1px solid var(--card-border)', overflow:'hidden' }}>
              {/* chapter header */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px', padding:'14px 18px', background:'var(--bg)', borderBottom:'1px solid var(--card-border)' }}>
                <span style={{ fontSize:'1.5rem' }}>{ch.icon || '⚡'}</span>
                <span style={{ fontWeight:700, flex:1, fontSize:'0.95rem', color:'var(--text)' }}>{ch.headline || <span style={{ color:'var(--text-dim)' }}>Chapter {i+1}</span>}</span>
                <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                  <label style={{ display:'flex', gap:'6px', alignItems:'center', cursor:'pointer', fontSize:'0.8rem' }}>
                    <input type="checkbox" checked={!!ch.active} onChange={e => upChapter(i, 'active', e.target.checked)} style={{ width:13, height:13 }} />
                    Active
                  </label>
                  <button onClick={() => moveChapter(i, -1)} className="icon-btn" disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                  <button onClick={() => moveChapter(i, 1)} className="icon-btn" disabled={i === story.chapters.length - 1} style={{ opacity: i === story.chapters.length - 1 ? 0.3 : 1 }}>↓</button>
                  <button onClick={() => removeChapter(i)} className="icon-btn icon-btn-danger">🗑️</button>
                </div>
              </div>

              {/* chapter fields — all lowercase keys */}
              <div style={{ padding:'16px 18px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'14px' }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Chapter Icon (Emoji)</label>
                  <EmojiPicker value={ch.icon} onChange={v => upChapter(i, 'icon', v)} placeholder="⚡" />
                </div>
                <div className="form-group">
                  <label className="form-label">Animation</label>
                  <select className="form-control" value={ch.anim} onChange={e => upChapter(i, 'anim', e.target.value)}>
                    {ANIM_OPTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Orb 1 (rgba)</label>
                  <input className="form-control" value={ch.orb1} onChange={e => upChapter(i, 'orb1', e.target.value)} placeholder="rgba(…)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Orb 2 (rgba)</label>
                  <input className="form-control" value={ch.orb2} onChange={e => upChapter(i, 'orb2', e.target.value)} placeholder="rgba(…)" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Headline</label>
                  <input className="form-control" value={ch.headline} onChange={e => upChapter(i, 'headline', e.target.value)} placeholder="Chapter headline" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Paragraph</label>
                  <textarea className="form-control" rows={3} value={ch.para} onChange={e => upChapter(i, 'para', e.target.value)} placeholder="Chapter paragraph text…" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end' }}>
        <button onClick={handleSave} className="btn btn-primary" style={{ padding:'12px 28px', fontSize:'0.95rem' }} disabled={saving}>{saving ? '⏳ Saving…' : '💾 Save Story'}</button>
      </div>
    </div>
  );
}
