/**
 * Stream memo encryption — uses AES-GCM via Web Crypto.
 *
 * The key is derived from `SHA-256(senderHex || recipientHex)`, so both
 * parties (who know each other's address from the on-chain stream) can
 * decrypt, but a third party with only the URL cannot.
 */

/** Derive a 256-bit AES-GCM key from both participant addresses. */
async function deriveKey(senderHex: string, recipientHex: string): Promise<CryptoKey> {
    const raw = new TextEncoder().encode(
        senderHex.replace(/^(0x)+/i, '').toLowerCase() +
        recipientHex.replace(/^(0x)+/i, '').toLowerCase(),
    );
    const hash = await crypto.subtle.digest('SHA-256', raw);
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

/** Encrypt a memo string → base64url blob (IV + ciphertext). */
export async function encryptMemo(
    memo: string,
    senderHex: string,
    recipientHex: string,
): Promise<string> {
    const key = await deriveKey(senderHex, recipientHex);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        new TextEncoder().encode(memo),
    );
    const combined = new Uint8Array(iv.length + new Uint8Array(ct).length);
    combined.set(iv);
    combined.set(new Uint8Array(ct), iv.length);
    let binaryStr = '';
    for (let i = 0; i < combined.length; i++) binaryStr += String.fromCharCode(combined[i]);
    return btoa(binaryStr)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/** Decrypt a base64url blob → memo string (or null on failure). */
export async function decryptMemo(
    encoded: string,
    senderHex: string,
    recipientHex: string,
): Promise<string | null> {
    try {
        const key = await deriveKey(senderHex, recipientHex);
        const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
        const combined = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            ciphertext,
        );
        return new TextDecoder().decode(decrypted);
    } catch {
        return null;
    }
}

/** Read encrypted memo from current URL hash (#memo=...). */
export function getMemoFromHash(): string | null {
    const hash = window.location.hash;
    const match = hash.match(/[#&]memo=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/** Build a shareable URL with the encrypted memo in the hash. */
export function buildMemoUrl(baseUrl: string, encryptedMemo: string): string {
    const url = new URL(baseUrl);
    url.hash = `memo=${encodeURIComponent(encryptedMemo)}`;
    return url.toString();
}
