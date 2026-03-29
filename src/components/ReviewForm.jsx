import { useState } from 'react';
import api from '../api/axios';

export default function ReviewForm({ orderId, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (text.length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    console.log('Submitting review:', { orderId, rating, textLength: text.length });
    setLoading(true);
    try {
      const response = await api.post('/reviews', { orderId, rating, text });
      console.log('Review submitted successfully:', response.data);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Review submission error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
        <h3>Thank You!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Your review helps us improve and guides other customers
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Share Your Experience</h3>
      
      <form onSubmit={handleSubmit}>
        {/* Rating Stars */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', fontWeight: '500' }}>
            Rating
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  opacity: star <= rating ? 1 : 0.3,
                  transform: star <= rating ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                ★
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {rating === 5 && "Amazing experience! 🚀"}
            {rating === 4 && "Very satisfied! 👍"}
            {rating === 3 && "Good experience"}
            {rating === 2 && "Could be better"}
            {rating === 1 && "Needs improvement"}
          </p>
        </div>

        {/* Review Text */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '500' }}>
            Your Review {text.length}/1000 characters
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 1000))}
            placeholder="Tell us about your experience with this order..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.02)',
              color: 'var(--text)',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            required
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Minimum 10 characters required
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#ef4444',
            fontSize: '0.9rem'
          }}>
            ⚠ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading || text.length < 10}
            className="btn btn-primary"
            style={{ flex: 1, padding: '12px' }}
          >
            {loading ? '⏳ Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline"
            style={{ flex: 1, padding: '12px' }}
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}
