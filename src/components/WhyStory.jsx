import { useEffect, useState } from 'react';

export default function WhyStory({ chapters }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!chapters || chapters.length === 0) return;

    function onScroll() {
      const outer = document.getElementById('why-story-outer');
      if (!outer) return;
      const rect = outer.getBoundingClientRect();
      const total = outer.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      if (scrolled < 0 || scrolled > total) return;
      const idx = Math.min(Math.floor((scrolled / total) * chapters.length), chapters.length - 1);
      setActive(idx);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [chapters]);

  if (!chapters || chapters.length === 0) return null;
  const ch = chapters[active];

  return (
    <section className="why-story-outer" id="why-story-outer">
      <div className="why-story-sticky">
        <div className="why-bg-orb why-orb-1" style={{ background: ch.orb1 || 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 65%)' }} />
        <div className="why-bg-orb why-orb-2" style={{ background: ch.orb2 || 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 65%)' }} />

        <div className="why-eyebrow">Why Choose KM Gadgets</div>
        <div className="why-mega-wrap"><span className="why-mega-icon">{ch.icon || '✨'}</span></div>

        <div className="why-chapter-num">
          <span>{String(active + 1).padStart(2, '0')}</span>
          <span className="why-chap-sep"> / </span>
          <span>{String(chapters.length).padStart(2, '0')}</span>
        </div>

        <div className="why-story-text">
          <h2 className="why-story-headline">{ch.headline || 'No headline'}</h2>
          <p className="why-story-para">{ch.para || 'No story text available yet.'}</p>
        </div>

        <div className="why-scroll-hint" id="why-scroll-hint">
          <span>Scroll to explore</span>
          <div className="wsh-arrow" />
        </div>

        <div className="why-progress-row">
          <div className="why-dots">
            {chapters.map((_, i) => (
              <button
                key={i}
                className={`wsd${i === active ? ' active' : ''}`}
                onClick={() => {
                  const outer = document.getElementById('why-story-outer');
                  if (!outer) return;
                  const total = outer.offsetHeight - window.innerHeight;
                  window.scrollTo({ top: outer.offsetTop + (i / chapters.length) * total + 1, behavior: 'smooth' });
                }}
              />
            ))}
          </div>

          <div className="why-progress-bar">
            <div className="why-pbar-fill" style={{ width: `${((active + 1) / chapters.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}