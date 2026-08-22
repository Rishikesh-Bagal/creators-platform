import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import { toast } from 'react-toastify';
import { toast as hotToast } from 'react-hot-toast';
import api from '../services/api';
import socket from '../services/socket';

function Dashboard() {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Posts state
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);

    const fetchPosts = useCallback(async (pageNum) => {
        // EVENT LOOP & ASYNC/AWAIT DEMONSTRATION:
        // 1. Synchronous code executes first (Call Stack)
        console.log("A: Starting fetchPosts (Synchronous execution)");
        
        setLoading(true);
        try {
            // 2. The `await` keyword pauses execution of this function.
            // The actual API request is offloaded to Web APIs (browser).
            console.log("B: Awaiting api.get (Offloading to Web API)");
            const response = await api.get(`/posts?page=${pageNum}&limit=5`);
            
            // 3. Once the Promise resolves, this continuation is pushed to the Microtask Queue
            // and executed by the Event Loop.
            console.log("C: Promise resolved, updating state (Microtask Queue execution)");
            
            setPosts(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
            setTotalPosts(response.data.pagination.total);
        } catch (err) {
            // Proper error handling for async operations
            const message = err.response?.data?.message || 'Failed to load posts';
            toast.error(message);
        } finally {
            // `finally` always executes regardless of success or failure
            console.log("D: fetchPosts complete (Finally block)");
            setLoading(false);
        }
    }, []);

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        // Optimistic UI Update: Remove post from state immediately
        const originalPosts = [...posts];
        setPosts(posts.filter(post => post._id !== postId));

        try {
            await api.delete(`/posts/${postId}`);
            setTotalPosts(prev => prev - 1);
            toast.success('Post deleted successfully');
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to delete post';
            toast.error(message);
            // Rollback on error
            setPosts(originalPosts);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }

        if (user) {
            fetchPosts(page);
        }
    }, [user, authLoading, navigate, page, fetchPosts]);

    // Socket.io: connect when authenticated, clean up on unmount
    useEffect(() => {
        if (!user) return;

        // Update auth token in case it changed since socket was created
        socket.auth = { token: localStorage.getItem('token') };

        // Connect the socket
        socket.connect();

        socket.on('connect', () => {
            console.log(`✅ Connected to socket: ${socket.id}`);
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from socket');
        });

        socket.on('connect_error', (err) => {
            console.error(`Socket connection error: ${err.message}`);
        });

        // Listen for new post notifications
        socket.on('newPost', (data) => {
            hotToast.success(data.message, {
                duration: 4000,
                position: 'top-right',
            });
        });

        // Cleanup on unmount / user change
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('newPost');
            socket.disconnect();
        };
    }, [user]);

    const handleNextPage = () => {
        if (page < totalPages) setPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(prev => prev - 1);
    };

    if (authLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <main className="dashboard">
            <div className="dashboard-inner">
                {/* Welcome */}
                <div className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user.name} 👋</h1>
                        <p className="dashboard-subtitle">Here&apos;s what&apos;s happening with your content</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/create-post" className="btn btn-primary">+ New Post</Link>
                        <button onClick={logout} className="btn btn-outline">Logout</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">📝</span>
                        <span className="stat-value">{totalPosts}</span>
                        <span className="stat-label">Total Posts</span>
                    </div>
                </div>

                {/* Posts Table */}
                <div className="recent-section">
                    <div className="section-header">
                        <h2 className="section-heading">Your Posts</h2>
                    </div>

                    {loading ? (
                        <div className="loading-posts">Loading posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="empty-posts">
                            <p>You haven&apos;t created any posts yet.</p>
                            <Link to="/create-post" className="btn btn-link">Create your first post</Link>
                        </div>
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="posts-table">
                                    <thead>
                                        <tr>
                                            <th>Cover</th>
                                            <th>Title</th>
                                            <th>Date</th>
                                            <th>Content Preview</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map((post) => (
                                            <tr key={post._id}>
                                                <td className="post-cover-cell">
                                                    {post.coverImage ? (
                                                        <img 
                                                            src={post.coverImage} 
                                                            alt={`Cover image for ${post.title}`} 
                                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                        />
                                                    ) : (
                                                        <span style={{ color: '#999', fontSize: '0.8rem' }}>No image</span>
                                                    )}
                                                </td>
                                                <td className="post-title-cell">{post.title}</td>
                                                <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                                <td className="post-preview-cell">
                                                    {post.content.substring(0, 50)}...
                                                </td>
                                                <td className="actions-cell">
                                                    <Link to={`/edit/${post._id}`} className="btn btn-small btn-edit">Edit</Link>
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        className="btn btn-small btn-delete"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="pagination">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={page === 1}
                                    className="btn btn-small"
                                >
                                    Previous
                                </button>
                                <span className="page-info">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={page === totalPages}
                                    className="btn btn-small"
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Dashboard;
