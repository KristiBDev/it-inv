import QRCode from 'qrcode';

/**
 * Generate a QR code for an item that links to its edit page
 * @param {string} customId - The item's unique ID
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateItemQRCode = async (customId) => {
    try {
        // Determine the base URL (this should be configured properly in production)
        // For now, we'll use a relative URL that will work when scanned from the same domain
        const editPageUrl = `/items/edit/${customId}`;
        
        // Use toDataURL to get a base64 encoded image
        const qrCodeBase64 = await QRCode.toDataURL(editPageUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        return qrCodeBase64;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

/**
 * Generate a QR code with a complete URL for an item's edit page
 * @param {string} customId - The item's unique ID
 * @param {string} baseUrl - The base URL for the application
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateItemQRCodeWithBaseUrl = async (customId, baseUrl) => {
    try {
        // Create a complete URL including the base domain
        const editPageUrl = `${baseUrl}/items/edit/${customId}`;
        
        // Use toDataURL to get a base64 encoded image
        const qrCodeBase64 = await QRCode.toDataURL(editPageUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        return qrCodeBase64;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};
