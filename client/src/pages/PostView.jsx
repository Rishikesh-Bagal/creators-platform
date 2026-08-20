import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function PostView() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                setPost(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load post');
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                <p>Loading post...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Error</h2>
                <p>{error}</p>
                <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
        );
    }

    if (!post) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
                <h2>Post not found</h2>
                <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
        );
    }

    return (
        <main className="post-view-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <Link to="/" style={{ color: '#666', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
                &larr; Back to Home
            </Link>
            
            <article>
                <header style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{post.title}</h1>
                    <div style={{ display: 'flex', gap: '20px', color: '#666', fontSize: '0.9rem' }}>
                        <span>👤 {post.author?.name || 'Unknown Author'}</span>
                        <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </header>

                {post.coverImage && (
                    <div style={{ marginBottom: '40px' }}>
                        <img 
                            src={post.coverImage} 
                            alt={post.title} 
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px' }} 
                        />
                    </div>
                )}

                <div 
                    className="post-content" 
                    style={{ 
                        fontSize: '1.1rem', 
                        lineHeight: '1.8', 
                        color: '#333',
                        whiteSpace: 'pre-wrap'
                    }}
                >
                    {post.content}
                </div>
            </article>
        </main>
    );
}

export default PostView;
