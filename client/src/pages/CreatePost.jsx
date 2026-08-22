import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './CreatePost.css';
import ImageUpload from '../components/ImageUpload';
import useDebounce from '../hooks/useDebounce';

/**
 * CLOSURE DEMONSTRATION:
 * This factory function creates an autosaver. 
 * The inner function retains access to `lastSavedTime` and `saveCount` 
 * from its outer lexical scope, even after `createAutosaver` has finished executing.
 */
function createAutosaver() {
    let lastSavedTime = null;
    let saveCount = 0;

    return function saveDraft(title, content) {
        if (!title && !content) return false;
        
        localStorage.setItem('draft_title', title);
        localStorage.setItem('draft_content', content);
        
        // These variables are preserved in the closure across multiple calls
        lastSavedTime = new Date().toLocaleTimeString();
        saveCount++;
        
        console.log(`[Closure Log] Draft saved at ${lastSavedTime}. Total saves: ${saveCount}`);
        return true;
    };
}

// Instantiate the closure
const saveDraft = createAutosaver();

function CreatePost() {
    // Initialize state from localStorage if a draft exists
    const [title, setTitle] = useState(() => localStorage.getItem('draft_title') || '');
    const [content, setContent] = useState(() => localStorage.getItem('draft_content') || '');
    const [coverImageUrl, setCoverImageUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const navigate = useNavigate();

    // The debounced values will only update 1000ms after the user stops typing
    const debouncedTitle = useDebounce(title, 1000);
    const debouncedContent = useDebounce(content, 1000);

    // Auto-save logic utilizing the debounced values and the closure
    useEffect(() => {
        if (debouncedTitle || debouncedContent) {
            // Calling the closure inner function
            saveDraft(debouncedTitle, debouncedContent);
        }
    }, [debouncedTitle, debouncedContent]);

    // Cleanup on unmount if a cover image was uploaded but post wasn't submitted
    useEffect(() => {
        return () => {
            // Standard cleanup during active sessions.
        };
    }, []);

    const generateIdea = async () => {
        setGeneratingAI(true);
        try {
            const response = await api.post('/ai/generate-idea', { topic: title });
            setTitle(response.data.data.title);
            setContent(response.data.data.content);
            toast.success('AI Idea Generated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate AI idea');
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/posts', { title, content, coverImage: coverImageUrl });
            
            // Clear drafts on successful post
            localStorage.removeItem('draft_title');
            localStorage.removeItem('draft_content');
            
            toast.success('Post created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create post');
            setLoading(false);
        }
    };

    const handleUpload = async (formData) => {
        setUploading(true);
        setUploadError(null);
        try {
            const response = await api.post('/upload', formData);
            
            // Delete the old image from Cloudinary to prevent orphans
            if (coverImageUrl) {
                api.delete('/upload', { data: { url: coverImageUrl } }).catch(err => console.error("Failed to clean up old image", err));
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
        if (coverImageUrl) {
            api.delete('/upload', { data: { url: coverImageUrl } }).catch(err => console.error("Failed to clean up image", err));
        }
        setCoverImageUrl(null);
    };

    return (
        <div className="create-post-container">
            <div className="create-post-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Create New Post</h1>
                    <button 
                        type="button" 
                        onClick={generateIdea} 
                        disabled={generatingAI}
                        className="btn btn-secondary"
                        style={{ background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)', border: 'none' }}
                    >
                        {generatingAI ? '✨ Generating...' : '✨ AI Idea'}
                    </button>
                </div>
                
                <ImageUpload onUpload={handleUpload} onClear={handleClearImage} />
                
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
                            placeholder="Enter post title or a topic for AI..."
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
                        <span style={{ fontSize: '0.8rem', color: '#666', marginRight: 'auto', alignSelf: 'center' }}>
                            {debouncedTitle !== title || debouncedContent !== content ? 'Typing...' : 'Draft saved.'}
                        </span>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => {
                                handleClearImage();
                                navigate('/dashboard');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || uploading}
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreatePost;
