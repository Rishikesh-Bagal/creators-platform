import React, { useState, useEffect } from 'react';

const ImageUpload = ({ onUpload, initialImage = null, onClear = null }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(initialImage);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialImage) {
            setPreviewUrl(initialImage);
        }
    }, [initialImage]);

    const validateFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return 'Please select an image file (jpeg, png, webp, gif).';
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Max limit is 5MB.`;
        }

        return null;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        
        // Revoke the old URL synchronously inside handleFileChange before calling setPreviewUrl
        if (previewUrl && previewUrl !== initialImage) {
            URL.revokeObjectURL(previewUrl);
        }

        if (!file) {
            setSelectedFile(null);
            setPreviewUrl(initialImage);
            setError(null);
            return;
        }

        const validationError = validateFile(file);
        
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            setPreviewUrl(initialImage);
            return;
        }

        setError(null);
        setSelectedFile(file);

        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
    };

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== initialImage) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl, initialImage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedFile || error) {
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        if (onUpload) {
            onUpload(formData);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        // Reset file input
        const input = document.getElementById('imageUploadInput');
        if (input) input.value = '';
        
        if (onClear) {
            onClear();
        }
    };

    return (
        <div className="image-upload-wrapper" style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
                <label htmlFor="imageUploadInput" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Image</label>
                <input
                    type="file"
                    id="imageUploadInput"
                    accept="image/jpeg, image/png, image/webp, image/gif"
                    onChange={handleFileChange}
                    className="form-control"
                />
            </div>

            {error && (
                <div className="error-message" style={{ color: 'red', marginTop: '10px', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            {previewUrl && !error && (
                <div className="preview-container" style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <p style={{ marginBottom: '5px', fontSize: '0.9rem', color: '#666' }}>Preview Image:</p>
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                            width: '100%',
                            maxWidth: '300px',
                            maxHeight: '300px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '10px'
                        }}
                    />
                    <div>
                        <button type="button" onClick={handleClear} className="btn btn-outline btn-small">Clear Image</button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={!selectedFile || !!error}
                className="btn btn-secondary"
                style={{ marginTop: '10px' }}
            >
                Upload Preview File
            </button>
        </div>
    );
};

export default ImageUpload;
