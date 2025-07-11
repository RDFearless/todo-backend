const globalErrorHandler = (err, _, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        statusCode,
        message,
        success: false,
        data: null
    })
    
    next();
}

export { globalErrorHandler };