import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Plus, Send, Clock, ChevronDown, ChevronUp, Tag, User, ArrowRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useAuth } from '../context/AuthContext';
import { fetchDiscussions, createThread, addComment as apiAddComment } from '../api/discussions.api';

const CATEGORIES = ['General', 'Negotiation', 'Interview', 'Offer Evaluation', 'Career Growth', 'Company Review'];

const CATEGORY_COLORS = {
  'General': '#94a3b8',
  'Negotiation': '#f59e0b',
  'Interview': '#8b5cf6',
  'Offer Evaluation': '#10b981',
  'Career Growth': '#3b82f6',
  'Company Review': '#ec4899',
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function DiscussPage({ onSignInClick }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [expandedThread, setExpandedThread] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadThreads = useCallback(async () => {
    try {
      const data = await fetchDiscussions();
      setThreads(data);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // Auth headers are handled automatically by the API client (api/client.js)

  const handleNewPost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setPosting(true);

    try {
      const thread = await createThread({
        title: DOMPurify.sanitize(newTitle.trim()),
        body: DOMPurify.sanitize(newBody.trim()),
        category: newCategory,
      });
      setThreads(prev => [thread, ...prev]);
      setNewTitle('');
      setNewBody('');
      setNewCategory('General');
      setShowNewPost(false);
    } catch (err) {
      console.error('Failed to post:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (threadId) => {
    if (!commentText.trim()) return;
    setPosting(true);

    try {
      const comment = await apiAddComment(threadId, {
        body: DOMPurify.sanitize(commentText.trim()),
      });
      setThreads(prev => prev.map(t =>
        t.id === threadId
          ? { ...t, comments: [...t.comments, comment] }
          : t
      ));
      setCommentText('');
    } catch (err) {
      console.error('Failed to comment:', err);
    } finally {
      setPosting(false);
    }
  };

  const filteredThreads = activeFilter === 'All'
    ? threads
    : threads.filter(t => t.category === activeFilter);

  // Seed data for empty state
  const seedThreads = [
    {
      id: 'seed-1',
      title: 'Is ₹45L a fair offer for Amazon SDE2 in Bangalore?',
      body: 'Just received an offer from Amazon for SDE2 role in Bangalore. The total comp is around ₹45L (Base: ₹28L + RSUs + Bonus). I have 3.5 YOE. Is this competitive for the current market? What should I counter with?',
      category: 'Offer Evaluation',
      author: 'anon_dev_42',
      authorId: 'seed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      comments: [
        { id: 'sc-1', body: 'That seems a bit low for SDE2. I got ₹52L last month. Push on the RSU allocation.', author: 'verified_swe', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
        { id: 'sc-2', body: 'Depends on your competing offers. If you have none, ₹45L is decent. With a competing offer you can push to ₹55L+.', author: 'tech_lead_99', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
      ],
      upvotes: 12,
    },
    {
      id: 'seed-2',
      title: 'Google L5 vs Meta E5 — which has better long-term growth?',
      body: 'I have offers from both Google (L5) and Meta (E5). Comp is roughly similar (~₹80L). Looking for advice on career trajectory, WLB, and RSU upside. Anyone who\'s been at both?',
      category: 'Career Growth',
      author: 'career_switch',
      authorId: 'seed',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      comments: [
        { id: 'sc-3', body: 'Google L5 is much more stable. Meta has higher variance in RSUs but also higher risk of layoffs.', author: 'ex_faang', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
      ],
      upvotes: 24,
    },
    {
      id: 'seed-3',
      title: 'How to negotiate signing bonus at Microsoft?',
      body: 'Got an SDE2 offer from Microsoft Hyderabad. They offered ₹5L signing bonus. I\'ve heard people getting ₹10-15L. What\'s the best strategy to push for more?',
      category: 'Negotiation',
      author: 'negotiator_pro',
      authorId: 'seed',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      comments: [
        { id: 'sc-4', body: 'Always mention competing offers. Even if you don\'t have one, say you\'re "in advanced stages" with another company.', author: 'hired_3x', createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString() },
        { id: 'sc-5', body: 'Microsoft is generally flexible on signing bonus. Ask your recruiter directly — they expect negotiation.', author: 'ms_insider', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
        { id: 'sc-6', body: 'Got ₹12L signing by showing a Flipkart offer letter. YMMV.', author: 'comp_hacker', createdAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString() },
      ],
      upvotes: 31,
    },
    {
      id: 'seed-4',
      title: 'Stripe L2 onsite experience — what to expect?',
      body: 'I have a Stripe L2 onsite coming up next week. Has anyone gone through it recently? What kind of system design questions do they ask at L2? Any tips?',
      category: 'Interview',
      author: 'stripe_hopeful',
      authorId: 'seed',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      comments: [
        { id: 'sc-7', body: 'Focus on API design rather than distributed systems. They love clean, pragmatic solutions.', author: 'stripe_alum', createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString() },
      ],
      upvotes: 8,
    },
    {
      id: 'seed-5',
      title: 'Honest review of working at Flipkart in 2026',
      body: 'Been at Flipkart for 2 years now (SDE2). AMA about WLB, comp progression, internal politics, and whether it\'s worth joining in the current market.',
      category: 'Company Review',
      author: 'fk_insider',
      authorId: 'seed',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      comments: [
        { id: 'sc-8', body: 'How\'s the RSU situation after the Walmart acquisition? Do refreshers actually happen?', author: 'curious_dev', createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString() },
        { id: 'sc-9', body: 'WLB depends heavily on the team. Supply chain is brutal, Payments is chill.', author: 'fk_insider', createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString() },
      ],
      upvotes: 19,
    },
  ];

  const displayThreads = threads.length > 0
    ? filteredThreads
    : (activeFilter === 'All' ? seedThreads : seedThreads.filter(t => t.category === activeFilter));

  return (
    <div className="discuss-page">
      <div className="discuss-header">
        <div className="discuss-title-row">
          <div>
            <h1 className="discuss-title">
              <MessageSquare size={28} className="text-accent" />
              Community Terminal
            </h1>
            <p className="discuss-subtitle">Anonymous intel, negotiation tactics, and real talk from verified engineers.</p>
          </div>
          <button
            className="btn-add-offer"
            onClick={() => {
              if (!user) { onSignInClick(); return; }
              setShowNewPost(!showNewPost);
            }}
          >
            <Plus size={16} />
            New Post
          </button>
        </div>

        <div className="discuss-filters">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              className={`discuss-filter-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
              style={activeFilter === cat && cat !== 'All' ? { borderColor: CATEGORY_COLORS[cat], color: CATEGORY_COLORS[cat] } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="discuss-new-post glass-card">
          <h3>Create a New Thread</h3>
          <div className="new-post-form">
            <input
              type="text"
              placeholder="Thread title..."
              className="discuss-input"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <textarea
              placeholder="Share your question, experience, or insight..."
              className="discuss-textarea"
              rows={4}
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
            />
            <div className="new-post-actions">
              <select
                className="discuss-select"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleNewPost}
                disabled={posting || !newTitle.trim() || !newBody.trim()}
              >
                {posting ? 'Posting...' : 'Publish'}
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thread Feed */}
      <div className="discuss-feed">
        {loading ? (
          <div className="discuss-loading">
            {[1, 2, 3].map(i => (
              <div key={i} className="discuss-skeleton glass-card" />
            ))}
          </div>
        ) : displayThreads.length === 0 ? (
          <div className="discuss-empty glass-card">
            <MessageSquare size={48} />
            <h3>No threads yet</h3>
            <p>Be the first to start a discussion!</p>
          </div>
        ) : (
          displayThreads.map(thread => (
            <div key={thread.id} className="discuss-thread glass-card">
              <div className="thread-main" onClick={() => setExpandedThread(expandedThread === thread.id ? null : thread.id)}>
                <div className="thread-meta-top">
                  <span
                    className="thread-category"
                    style={{ color: CATEGORY_COLORS[thread.category], borderColor: CATEGORY_COLORS[thread.category] }}
                  >
                    <Tag size={12} />
                    {thread.category}
                  </span>
                  <span className="thread-time">
                    <Clock size={12} />
                    {timeAgo(thread.createdAt)}
                  </span>
                </div>

                <h3 className="thread-title">{DOMPurify.sanitize(thread.title)}</h3>
                <p className="thread-body-preview">{DOMPurify.sanitize(thread.body.length > 200 ? thread.body.substring(0, 200) + '...' : thread.body)}</p>

                <div className="thread-footer">
                  <div className="thread-author">
                    <User size={14} />
                    <span>{thread.author}</span>
                  </div>
                  <div className="thread-stats">
                    <span className="thread-comments-count">
                      <MessageSquare size={14} />
                      {thread.comments?.length || 0} replies
                    </span>
                    <span className="thread-expand">
                      {expandedThread === thread.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Comments */}
              {expandedThread === thread.id && (
                <div className="thread-expanded">
                  {thread.body.length > 200 && (
                    <p className="thread-full-body">{DOMPurify.sanitize(thread.body)}</p>
                  )}

                  <div className="thread-comments">
                    {thread.comments && thread.comments.length > 0 ? (
                      thread.comments.map(comment => (
                        <div key={comment.id} className="thread-comment">
                          <div className="comment-author">
                            <User size={12} />
                            <span className="comment-name">{comment.author}</span>
                            <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                          </div>
                          <p className="comment-body">{DOMPurify.sanitize(comment.body)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">No replies yet. Be the first!</p>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="thread-reply">
                    {user ? (
                      <div className="reply-input-row">
                        <input
                          type="text"
                          placeholder="Write a reply..."
                          className="discuss-input reply-input"
                          value={expandedThread === thread.id ? commentText : ''}
                          onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleComment(thread.id)}
                        />
                        <button
                          className="btn btn-primary reply-btn"
                          onClick={() => handleComment(thread.id)}
                          disabled={posting || !commentText.trim()}
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-outline reply-signin" onClick={onSignInClick}>
                        Sign in to reply <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
