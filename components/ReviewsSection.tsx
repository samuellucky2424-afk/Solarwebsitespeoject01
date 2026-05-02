import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

export interface Review {
  id: string;
  userId: string;
  customerName: string;
  avatar?: string;
  rating: number;
  comment: string;
  date: string;
  targetId: string;
  targetType: 'product' | 'package' | 'gallery';
}

interface ReviewsSectionProps {
  targetId: string;
  targetType: 'product' | 'package' | 'gallery';
}

const StarRow: React.FC<{ value: number; size?: string; onChange?: (v: number) => void; }> = ({ value, size = 'text-xl', onChange }) => {
  const interactive = !!onChange;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={`material-symbols-outlined ${size} transition-colors ${i <= value ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} ${interactive ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
          style={{ fontVariationSettings: i <= value ? '"FILL" 1' : '"FILL" 0' }}
        >
          star
        </button>
      ))}
    </div>
  );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ targetId, targetType }) => {
  const { user } = useAuth();
  const { activeUser } = useAdmin();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mapRow = (row: any): Review => {
    const meta = row?.metadata || {};
    return {
      id: String(row.id),
      userId: row.user_id,
      customerName: meta.customer_name || 'Customer',
      avatar: meta.avatar,
      rating: Number(meta.rating) || 0,
      comment: row.description || '',
      date: row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
      targetId: meta.target_id,
      targetType: meta.target_type,
    };
  };

  const fetchReviews = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('greenlife_hub')
        .select('*')
        .eq('type', 'review')
        .filter('metadata->>target_id', 'eq', targetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch reviews:', error.message);
        setReviews([]);
      } else {
        setReviews((data || []).map(mapRow));
      }
    } catch (err) {
      console.warn('Reviews fetch error:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const userReview = user ? reviews.find(r => r.userId === user.id) : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Please log in to submit a review.');
      return;
    }
    if (rating < 1) {
      setError('Please choose a star rating.');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter a comment.');
      return;
    }

    setSubmitting(true);
    try {
      const customerName = activeUser?.fullName || user.user_metadata?.full_name || user.email || 'Customer';
      const avatar = activeUser?.avatar || user.user_metadata?.avatar_url || '';

      // If user already has a review, update it; otherwise insert.
      if (userReview) {
        const { error } = await supabase
          .from('greenlife_hub')
          .update({
            description: comment.trim(),
            metadata: {
              target_id: targetId,
              target_type: targetType,
              rating,
              customer_name: customerName,
              avatar,
            },
          })
          .eq('id', userReview.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setSuccess('Review updated.');
      } else {
        const { error } = await supabase
          .from('greenlife_hub')
          .insert([{
            type: 'review',
            user_id: user.id,
            description: comment.trim(),
            title: `${targetType} review`,
            metadata: {
              target_id: targetId,
              target_type: targetType,
              rating,
              customer_name: customerName,
              avatar,
            },
          }]);

        if (error) throw error;
        setSuccess('Review posted. Thank you!');
      }

      setComment('');
      setRating(0);
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || 'Could not save review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Delete your review?')) return;
    try {
      const { error } = await supabase
        .from('greenlife_hub')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchReviews();
    } catch (err: any) {
      setError(err?.message || 'Could not delete review.');
    }
  };

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  // Pre-fill form when editing existing review
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment);
    }
  }, [userReview?.id]);

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-forest dark:text-white">Reviews & Ratings</h3>
          <div className="flex items-center gap-2 mt-1">
            <StarRow value={Math.round(avg)} size="text-base" />
            <span className="text-sm font-bold text-forest dark:text-white">
              {avg.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* Submit form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <p className="text-sm font-bold mb-2 text-forest dark:text-white">
            {userReview ? 'Update your review' : 'Leave a review'}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500">Your rating:</span>
            <StarRow value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            maxLength={1000}
            className="w-full p-3 rounded-lg bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 text-sm text-forest dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
            <div className="text-xs">
              {error && <span className="text-red-500">{error}</span>}
              {success && <span className="text-green-600">{success}</span>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-forest px-5 py-2 rounded-lg font-bold text-sm hover:brightness-105 transition disabled:opacity-60"
            >
              {submitting ? 'Saving...' : userReview ? 'Update Review' : 'Post Review'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">Please log in to leave a review.</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-sm text-gray-500 py-6">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-6">No reviews yet. Be the first to leave one!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-3 md:p-4 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-black/10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {r.avatar ? (
                    <img src={r.avatar} alt={r.customerName} className="size-9 rounded-full object-cover border border-gray-200 dark:border-white/10" />
                  ) : (
                    <div className="size-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {r.customerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-forest dark:text-white">{r.customerName}</p>
                    <div className="flex items-center gap-2">
                      <StarRow value={r.rating} size="text-sm" />
                      <span className="text-[10px] text-gray-500">{r.date}</span>
                    </div>
                  </div>
                </div>
                {user && r.userId === user.id && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    title="Delete your review"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
