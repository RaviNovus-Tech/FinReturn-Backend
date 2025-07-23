import crypto from "crypto";

const charset =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // 62 characters
const charsetLength = charset.length;
const key = crypto.createHash("sha256").update("my_secret_key").digest(); // 32-byte key

// Encrypt ID to a 6-character string
function encryptId(id) {
  // Create a deterministic seed using HMAC
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(id.toString());
  const hash = hmac.digest("hex");

  // Convert first 6 bytes of hash to a 6-char string using charset
  let result = "";
  for (let i = 0; i < 6; i++) {
    const byte = parseInt(hash.slice(i * 2, i * 2 + 2), 16); // Take 2 hex chars (1 byte)
    result += charset[byte % charsetLength];
  }
  return result;
}

// Decrypt (reverse lookup, assuming IDs are known and limited)
function decryptId(encrypted) {
  // Since the transformation is deterministic but lossy, we need a lookup or brute-force known IDs
  // For simplicity, assume IDs are numeric and limited (e.g., 1 to 1000000)
  for (let id = 1; id <= 1000000; id++) {
    if (encryptId(id) === encrypted) {
      return id.toString();
    }
  }
  throw new Error("Invalid encrypted code");
}

export { encryptId, decryptId };
