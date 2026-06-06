/**
 * Centralized Error Handling Middleware
 * @param {Error} err - Error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const errorHandler = (err, req, res, next) => {
    // Log error for developers
    console.error('Error Stack:', err.stack);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Internal Server Error';

    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Handle Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyPattern)[0];
        if (field === 'email') {
            message = 'This email is already registered. Please login or use a different email.';
        } else {
            message = `This ${field} is already in use. Please try a different value.`;
        }
    }

    // Handle Mongoose Cast Error (Invalid ID)
    if (err.name === 'CastError') {
        statusCode = 404;
        message = `Resource not found with id of ${err.value}`;
    }

    // Set status and send response
    res.status(err.status || statusCode).json({
        success: false,
        message: message
    });
};

export default errorHandler;
