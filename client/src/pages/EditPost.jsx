import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './CreatePost.css'; // Reusing CreatePost styles
import ImageUpload from '../components/ImageUpload';

function EditPost() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [originalCoverImage, setOriginalCoverImage] = useState(null);
    const [coverImageUrl, setCoverImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/posts/${id}`);
                const { title, content, coverImage } = response.data.data;
                setTitle(title);
                setContent(content);
                setOriginalCoverImage(coverImage);
                setCoverImageUrl(coverImage);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch post:', err);
                toast.error(err.response?.data?.message || 'Failed to load post data');
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleUpload = async (formData) => {
        setUploading(true);
        setUploadError(null);
        try {
            const response = await api.post('/upload', formData);
            
            // If the user previously uploaded an image *during this edit session*, delete it.
            // We do not delete the original image until they click "Update Post".
            if (coverImageUrl && coverImageUrl !== originalCoverImage) {
                api.delete('/upload', { data: { url: coverImageUrl } }).catch(console.error);
            }
            
            setCoverImageUrl(response.data.url);
            toast.success('Image uploaded!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to upload image';
            setUploadError(msg);
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    const handleClearImage = () => {
        if (coverImageUrl && coverImageUrl !== originalCoverImage) {
            api.delete('/upload', { data: { url: coverImageUrl } }).catch(console.error);
        }
        setCoverImageUrl(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await api.put(`/posts/${id}`, { title, content, coverImage: coverImageUrl });
            
            // If the image was changed, clean up the old one from Cloudinary
            if (originalCoverImage && originalCoverImage !== coverImageUrl) {
                api.delete('/upload', { data: { url: originalCoverImage } }).catch(console.error);
            }

            toast.success('Post updated successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update post');
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading post data...</div>;
    }

    return (
        <div className="create-post-container">
            <div className="create-post-card">
                <h1>Edit Post</h1>
                
                <ImageUpload 
                    onUpload={handleUpload} 
                    onClear={handleClearImage} 
                    initialImage={coverImageUrl} 
                />
                
                {uploading && <div className="loading-state" style={{ color: '#0066cc', marginTop: '10px' }}>Uploading image...</div>}
                {uploadError && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{uploadError}</div>}

                <hr style={{ margin: '20px 0', border: '1px solid #eee' }} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter post title"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your content here..."
                            rows="10"
                            required
                        ></textarea>
                    </div>
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                                handleClearImage(); // Clean up session uploads if canceling
                                navigate('/dashboard');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || uploading}
                        >
                            {submitting ? 'Updating...' : 'Update Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditPost;
