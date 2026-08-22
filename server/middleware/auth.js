import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Extract token from header: "Bearer <token>"
            token = req.headers.authorization.split(' ')[1];

            // JWT DEMONSTRATION: Verify token
            // The jwt.verify function synchronously verifies the token using the secret.
            // If the token is invalid or expired, it throws an error which is caught below.
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach user data to request object
            // The payload in authController.js uses { userId: user._id }
            req.user = { id: decoded.userId };

            next();
        } catch (error) {
            console.error('Token verification failed:', error.message);
            // JWT DEMONSTRATION: Invalid Token Handling
            // If the token is invalid, tampered with, or expired, we return a 401 Unauthorized status.
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        // JWT DEMONSTRATION: Missing Token Handling
        // If no token was provided in the header, we return a 401 Unauthorized status.
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
