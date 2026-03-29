import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const EP_DATA = [
  { key:'tech',    label:'📱 Tech',    list:['⌚','📱','💻','🖥','⌨','🖱','🎧','🔊','📻','📡','🔋','🔌','⚡','📷','📸','🎮','🕹','📺','🖨','💾','💿','📀','🧲','🔭','📲','🤳','🖲','💽'] },
  { key:'shop',    label:'🛒 Shop',    list:['🛒','🛍','💳','🏷','💰','💵','💴','🪙','💎','🎁','📦','🚚','🏪','🏬','📈','📊','💹','🏅','🥇','🏆','🎖','🎯','🔖','🗓','🤝','📑','🧾'] },
  { key:'symbols', label:'✨ Symbols', list:['⭐','🌟','✨','🔥','💥','🎉','🎊','⚡','🚀','💫','🌈','💡','🔔','📢','📣','💬','🗣','❤','💙','💚','💛','🧡','💜','🖤','🤍','💯','✅','❌','⚠','🆕','🔝','🆒'] },
  { key:'faces',   label:'😀 Faces',  list:['😀','😁','😍','🤩','🥳','😎','🤑','🫶','👍','👎','👏','🙌','🤝','💪','✌','🖖','👋','🤜','🤛','👑','🎭','🃏','🧠','👁','💀','🤖','👾'] },
  { key:'nature',  label:'🌿 Other',  list:['🌱','🌿','🍃','🌸','🌺','🌻','🌞','🍎','🍋','🍇','🍓','🫐','🧊','🔴','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔲','🔳','◼','◻','🔺','🔻','🔷','🔶','🔹','🔸'] }
];

export default function EmojiPicker({ value, onChange, placeholder = '😊' }) {
  const [open,   setOpen]   = useState(false);
  const [tab,    setTab]    = useState('tech');
  const [search, setSearch] = useState('');
  const [pos,    setPos]    = useState({ top: 0, left: 0 });
  const btnRef              = useRef();
  const popupRef            = useRef();

  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          btnRef.current  && !btnRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  function handleOpen() {
    if (open) { setOpen(false); return; }
    const r    = btnRef.current.getBoundingClientRect();
    const left = Math.min(r.left, window.innerWidth - 330);
    setPos({ top: r.bottom + 6, left: Math.max(6, left) });
    setSearch('');
    setTab('tech');
    setOpen(true);
  }

  function select(emoji) {
    onChange(emoji);
    setOpen(false);
  }

  const gridList = search
    ? EP_DATA.flatMap(s => s.list).filter(e => {
        try { return e.includes(search); } catch { return true; }
      })
    : (EP_DATA.find(s => s.key === tab)?.list || EP_DATA[0].list);

  const popup = (
    <div ref={popupRef} className="emoji-picker-popup" style={{ top: pos.top, left: pos.left }}>
      <div className="ep-tabs">
        {EP_DATA.map(s => (
          <button key={s.key} type="button"
            className={`ep-tab${tab === s.key && !search ? ' active' : ''}`}
            onClick={() => { setTab(s.key); setSearch(''); }}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="ep-grid">
        {gridList.map((e, i) => (
          <div key={i} className="ep-emoji" onClick={() => select(e)} title={e}>{e}</div>
        ))}
        {gridList.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'16px', color:'var(--text-dim)', fontSize:'0.82rem' }}>
            No results
          </div>
        )}
      </div>
      <div className="ep-footer">
        <input
          className="ep-search"
          placeholder="🔍 Filter…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="button" className="ep-close" onClick={() => setOpen(false)}>✕ Close</button>
      </div>
    </div>
  );

  return (
    <div className="emoji-input-wrap">
      <input
        className="form-control"
        style={{ textAlign:'center', fontSize:'1.3rem', maxWidth:70, letterSpacing:'2px' }}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <button ref={btnRef} type="button" className="emoji-trigger-btn" onClick={handleOpen}>
        {value ? `${value} Change` : `${placeholder} Pick Emoji`}
      </button>
      {open && createPortal(popup, document.body)}
    </div>
  );
}
