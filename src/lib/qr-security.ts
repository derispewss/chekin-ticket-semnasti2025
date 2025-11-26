import crypto from 'crypto';

/**
 * Generate a secure hash for QR code
 * Combines unique ID with timestamp and random salt for security
 */
export function generateQRHash(uniqueId: string): string {
    const timestamp = Date.now().toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const data = `${uniqueId}-${timestamp}-${salt}`;

    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
}

/**
 * Create a secure QR code payload
 * Format: uniqueId|hash
 */
export function createSecureQRPayload(uniqueId: string, hash: string): string {
    return `${uniqueId}|${hash}`;
}

/**
 * Parse QR code payload
 * Returns null if format is invalid
 */
export function parseQRPayload(payload: string): { uniqueId: string; hash: string } | null {
    const parts = payload.split('|');

    if (parts.length !== 2) {
        return null;
    }

    return {
        uniqueId: parts[0],
        hash: parts[1]
    };
}

/**
 * Validate if QR hash matches the stored hash
 */
export function validateQRHash(providedHash: string, storedHash: string | null | undefined): boolean {
    if (!storedHash) {
        return false;
    }

    return providedHash === storedHash;
}
