class ApiError extends Error {
    constructor(
        statusCode = 500,
        message = "Something went wrong"
    ) {
        super(message);
        this.data = null; // no data in error
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        Error.captureStackTrace(this, this.constructor);
    }
}

export { ApiError }