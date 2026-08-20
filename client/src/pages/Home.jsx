import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConnectionTest from "../components/common/ConnectionTest";
import api from '../services/api';
import './Home.css';

function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/posts/public?limit=6');
                setPosts(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch posts');
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <main className="home">
            {/* Hero */}
            <section className="hero">
                <div className="hero-inner">
                    <span className="hero-badge">✍️ A Platform for Creators</span>
                    <h1 className="hero-title">
                        Write. Share. <span className="gradient-text">Inspire.</span>
                    </h1>
                    <p className="hero-subtitle">
                        CreatorHub is the home for passionate writers and developers. Publish
                        your ideas, grow your audience, and connect with a community that cares
                        about quality content.
                    </p>
                    <div className="hero-actions">
                        <Link to="/register" className="btn btn-primary">Start Writing Free</Link>
                        <Link to="/login" className="btn btn-secondary">Sign In</Link>
                    </div>
                </div>
            </section>

            {/* Featured Posts */}
            <section className="featured">
                <div className="section-inner">
                    <h2 className="section-title">Featured Posts</h2>
                    <p className="section-subtitle">Handpicked articles from our top creators</p>
                    
                    {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading posts...</div>}
                    {error && <div style={{ textAlign: 'center', color: 'red', padding: '2rem' }}>{error}</div>}
                    
                    {!loading && !error && posts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            No posts found. Be the first to create one!
                        </div>
                    )}

                    {!loading && !error && posts.length > 0 && (
                        <div className="posts-grid">
                            {posts.map((post) => (
                                <article key={post._id} className="post-card">
                                    {post.coverImage && (
                                        <Link to={`/post/${post._id}`}>
                                            <img 
                                                src={post.coverImage} 
                                                alt={post.title} 
                                                style={{ width: '100%', height: '180px', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} 
                                            />
                                        </Link>
                                    )}
                                    <div style={{ padding: post.coverImage ? '1rem 0 0 0' : '0' }}>
                                        <Link to={`/post/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 className="post-title">{post.title}</h3>
                                        </Link>
                                        <p className="post-excerpt">{post.content.substring(0, 100)}...</p>
                                        <div className="post-meta">
                                            <span className="post-author">👤 {post.author?.name || 'Unknown'}</span>
                                            <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-inner">
                    <h2>Ready to share your story?</h2>
                    <p>Join thousands of creators publishing on CreatorHub today.</p>
                    <Link to="/register" className="btn btn-primary">Create Your Account</Link>
                </div>
            </section>

            {/* Backend Connection Test */}
            <section style={{ padding: "40px", textAlign: "center" }}>
                <ConnectionTest />
            </section>
        </main>
    );
}

export default Home;