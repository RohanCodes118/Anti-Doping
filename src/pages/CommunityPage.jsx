import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../contexts/AuthContext';
import { seedCommunityPosts } from '../data/communityData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Heart, Send, Users } from 'lucide-react';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommunityPage() {
  const { user, incrementCommunityInteraction } = useAuthContext();
  const [posts, setPosts] = useState([]);
  const [likedIds, setLikedIds] = useState([]);
  const [draft, setDraft] = useState('');

  const combineWithSeedPosts = (customPosts) => {
    const customIds = new Set((customPosts || []).map(p => p.id));
    const remainingSeeds = seedCommunityPosts.filter(p => !customIds.has(p.id));
    return [...(customPosts || []), ...remainingSeeds];
  };

  useEffect(() => {
    async function loadPosts() {
      let cachedPosts = [];
      try {
        const stored = localStorage.getItem('cq_community_posts');
        if (stored) cachedPosts = JSON.parse(stored);
      } catch (e) {}

      if (isSupabaseConfigured() && user?.id) {
        try {
          const { data: dbPosts } = await supabase
            .from('community_posts')
            .select('*')
            .order('created_at', { ascending: false });

          const { data: dbLikes } = await supabase
            .from('community_likes')
            .select('post_id')
            .eq('user_id', user.id);

          if (dbLikes) {
            setLikedIds(dbLikes.map(l => l.post_id));
          }

          if (dbPosts && dbPosts.length > 0) {
            const formatted = dbPosts.map(p => ({
              id: p.id,
              authorName: p.author_name,
              authorInitial: p.author_initial || p.author_name?.charAt(0).toUpperCase() || 'A',
              sport: p.sport || 'Athlete',
              text: p.text,
              likes: p.likes || 0,
              createdAt: p.created_at,
            }));
            const merged = combineWithSeedPosts(formatted);
            setPosts(merged);
            try { localStorage.setItem('cq_community_posts', JSON.stringify(merged)); } catch(e) {}
            return;
          }
        } catch (err) {
          console.error('Error loading community from Supabase:', err);
        }
      }

      if (cachedPosts && cachedPosts.length > 0) {
        setPosts(combineWithSeedPosts(cachedPosts));
      } else {
        setPosts(seedCommunityPosts);
        try { localStorage.setItem('cq_community_posts', JSON.stringify(seedCommunityPosts)); } catch(e) {}
      }
    }
    loadPosts();
  }, [user?.id]);

  const handleCreatePost = async () => {
    const text = draft.trim();
    if (!text || !user) return;

    const newPost = {
      id: 'post_' + Date.now(),
      authorName: user.name || 'Athlete',
      authorInitial: (user.name || 'A').charAt(0).toUpperCase(),
      sport: user.sport || 'Athlete',
      type: 'post',
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    setPosts(prev => {
      const updated = combineWithSeedPosts([newPost, ...prev]);
      try { localStorage.setItem('cq_community_posts', JSON.stringify(updated)); } catch(e) {}
      return updated;
    });

    setDraft('');
    if (incrementCommunityInteraction) {
      incrementCommunityInteraction(1);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('community_posts').insert({
          id: newPost.id,
          user_id: user.id,
          author_name: newPost.authorName,
          author_initial: newPost.authorInitial,
          sport: newPost.sport,
          text: newPost.text,
          likes: 0,
          created_at: newPost.createdAt,
        });
      } catch (err) {
        console.error('Error inserting community post:', err);
      }
    }
  };

  const handleToggleLike = async (postId) => {
    if (!user) return;
    const isLiked = likedIds.includes(postId);
    const updatedLikedIds = isLiked ? likedIds.filter(id => id !== postId) : [...likedIds, postId];
    setLikedIds(updatedLikedIds);

    setPosts(prev => {
      const updated = prev.map(p => (p.id === postId ? { ...p, likes: Math.max(0, p.likes + (isLiked ? -1 : 1)) } : p));
      try { localStorage.setItem('cq_community_posts', JSON.stringify(updated)); } catch(e) {}
      return updated;
    });

    if (!isLiked && incrementCommunityInteraction) incrementCommunityInteraction(1);

    if (isSupabaseConfigured()) {
      try {
        if (isLiked) {
          await supabase.from('community_likes').delete().eq('user_id', user.id).eq('post_id', postId);
        } else {
          await supabase.from('community_likes').insert({ user_id: user.id, post_id: postId });
        }
        const currentPost = posts.find(p => p.id === postId);
        if (currentPost) {
          const newCount = Math.max(0, currentPost.likes + (isLiked ? -1 : 1));
          await supabase.from('community_posts').update({ likes: newCount }).eq('id', postId);
        }
      } catch (err) {
        console.error('Error syncing like with Supabase:', err);
      }
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Users size={20} style={{ color: '#00d4ff' }} />
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800 }}>
              Community
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Share milestones, tips, and encouragement with fellow clean-sport athletes.
          </p>
        </div>

        {/* Composer */}
        <div style={{
          background: 'rgba(19, 25, 41, 0.8)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', padding: '18px', marginBottom: '24px',
        }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Share a milestone, ask a question, or cheer on your fellow athletes..."
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '12px 14px', color: 'var(--color-text-primary)',
              fontFamily: "'Inter', sans-serif", fontSize: '14px', resize: 'vertical', outline: 'none',
              marginBottom: '12px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCreatePost}
              disabled={!draft.trim()}
              className="btn-primary"
              style={{
                padding: '9px 18px', fontSize: '13px',
                opacity: draft.trim() ? 1 : 0.5, cursor: draft.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={13} /> Post
            </button>
          </div>
        </div>

        {/* Post Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {posts.map(post => {
            const isLiked = likedIds.includes(post.id);
            return (
              <div
                key={post.id}
                style={{
                  background: 'rgba(19, 25, 41, 0.8)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '15px', color: 'white',
                    flexShrink: 0,
                  }}>
                    {post.authorInitial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{post.authorName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      {post.sport} · {timeAgo(post.createdAt)}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                  {post.text}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleToggleLike(post.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
                      cursor: 'pointer', color: isLiked ? '#ec4899' : 'var(--color-text-secondary)',
                      fontSize: '13px', fontWeight: 500, transition: 'color 0.2s ease',
                    }}
                  >
                    <Heart size={15} fill={isLiked ? '#ec4899' : 'none'} />
                    <span>{post.likes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
