import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            const error = new Error('Please provide name, email, and password');
            error.status = 400;
            return next(error);
        }

        // Normalize email to lowercase for consistent checking
        const normalizedEmail = email.toLowerCase();

        // Check if user already exists (case-insensitive)
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            const error = new Error('This email is already registered. Please login or use a different email.');
            error.status = 400;
            return next(error);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
        });

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.status(201).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
    } catch (error) {
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const error_new = new Error('This email is already registered. Please login or use a different email.');
            error_new.status = 400;
            return next(error_new);
        }
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Public
export const updateUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Public
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).json({ success: true, message: 'User deleted successfully', _id: user._id });
    } catch (error) {
        next(error);
    }
};
