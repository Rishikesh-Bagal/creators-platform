import Post from '../models/Post.js';
import User from '../models/User.js';
import { capitalizeTitle } from '../utils/textFormatter.js';

// @desc    Create new post (with Socket.io event emission and Hoisting Demo)
// @route   POST /api/posts
// @access  Private
export const createPostWithSocket = (io) => async (req, res, next) => {
    try {
        const { title, content, coverImage } = req.body;

        if (!title || !content) {
            const error = new Error('Please provide title and content');
            error.status = 400;
            return next(error);
        }

        // Use the hoisted formatting utility
        const formattedTitle = capitalizeTitle(title);

        const post = await Post.create({
            title: formattedTitle,
            content,
            coverImage,
            author: req.user.id // From protect middleware
        });

        // Look up the author's name for the notification
        const author = await User.findById(req.user.id).select('name email');

        // Emit real-time event to all connected clients
        io.emit('newPost', {
            message: `New post created by ${author?.name || 'Someone'}!`,
            post: {
                _id: post._id,
                title: post.title,
                author: author?.name || 'Unknown'
            }
        });

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new post (legacy, kept for reference)
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
    try {
        const { title, content, coverImage } = req.body;

        if (!title || !content) {
            const error = new Error('Please provide title and content');
            error.status = 400;
            return next(error);
        }

        const post = await Post.create({
            title,
            content,
            coverImage,
            author: req.user.id // From protect middleware
        });

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all posts for logged in user (with pagination)
// @route   GET /api/posts
// @access  Private
export const getPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Count total posts for this user
        const total = await Post.countDocuments({ author: req.user.id });

        // Fetch paginated posts
        const posts = await Post.find({ author: req.user.id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: posts.length,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: posts
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get all public posts (with pagination)
// @route   GET /api/posts/public
// @access  Public
export const getPublicPosts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const total = await Post.countDocuments({});
        const posts = await Post.find({})
            .populate('author', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            count: posts.length,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            },
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'name');

        if (!post) {
            const error = new Error('Post not found');
            error.status = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
    try {
        let post = await Post.findById(req.params.id);

        if (!post) {
            const error = new Error('Post not found');
            error.status = 404;
            return next(error);
        }

        // Authorize: Check if post belongs to user
        if (post.author.toString() !== req.user.id) {
            const error = new Error('Not authorized to update this post');
            error.status = 403;
            return next(error);
        }

        post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            const error = new Error('Post not found');
            error.status = 404;
            return next(error);
        }

        // Authorize: Check if post belongs to user
        if (post.author.toString() !== req.user.id) {
            const error = new Error('Not authorized to delete this post');
            error.status = 403;
            return next(error);
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Post removed'
        });
    } catch (error) {
        next(error);
    }
};
