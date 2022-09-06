const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');

module.exports = (context) => {
    // console.log(context);
    const authHeader = context.req.headers.authorization;
    if (authHeader) {
        // Bearer token
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                const user = jwt.verify(token, process.env.SECRET_KEY);
                return user;
            } catch (err) {
                throw new AuthenticationError('Your session expired. Sign in again.');
            }
        }
        throw new Error("Authentication token must be 'Bearer [token]");
    }
    throw new Error("Authorization header must be provided.");
};