/**
 * Get the base URL from request or environment variables
 * @param {Express.Request} req - Express request object
 * @returns {string} - Base URL
 */
export const getBaseUrl = (req) => {
    // Try to get from environment variable first
    const configuredBaseUrl = process.env.APP_BASE_URL;
    if (configuredBaseUrl) {
        return configuredBaseUrl;
    }
    
    // Otherwise construct from request
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}`;
};
