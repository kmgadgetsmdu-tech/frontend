import { useState, useEffect } from 'react';

export default function TestimonialCarousel({ reviews = [] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2>What Our Customers Say</h2>
          <p>Real reviews from real buyers across Madurai</p>
          <div className="section-divider" />
        </div>

        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto' }}>
          {/* Carousel Container */}
          <div style={{ minHeight: '280px', perspective: '1000px' }}>
            {reviews.map((review, i) => (
              <div
                key={i}
                style={{
                  position: i === activeIdx ? 'relative' : 'absolute',
                  opacity: i === activeIdx ? 1 : 0,
                  transform: i === activeIdx 
                    ? 'scale(1)' 
                    : `scale(0.95) translateY(${i > activeIdx ? '20px' : '-20px'})`,
                  transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  pointerEvents: i === activeIdx ? 'auto' : 'none',
                  width: '100%'
                }}
              >
                <div className="testimonial-card">
                  <div className="t-quote">"</div>
                  <p className="t-text">{review.text}</p>
                  <div style={{ marginBottom: '16px' }}>
                    <div className="t-stars" style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>
                      {getRatingStars(review.rating)}
                    </div>
                  </div>
                  <div className="t-author">
                    <div className="t-avatar" style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2))' }}>
                      {review.name[0]}
                    </div>
                    <div>
                      <div className="t-name">{review.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(review.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          {reviews.length > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '28px'
            }}>
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIdx(i)}
                  style={{
                    width: i === activeIdx ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: i === activeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    padding: '0'
                  }}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Auto-play indicator */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            Showing {activeIdx + 1} of {reviews.length} • Auto-scrolling
          </div>
        </div>
      </div>
    </section>
  );
}
