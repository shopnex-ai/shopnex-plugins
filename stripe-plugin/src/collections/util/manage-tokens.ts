import crypto from "crypto";

type TokenPayload = string;
type EncryptedData = {
    iv: string;
    tag: string;
    content: string;
};

const getKey = (rawKey: string): Buffer => {
    return crypto.createHash("sha256").update(rawKey).digest();
};

const getTenantSecret = (tenantId: string): Buffer => {
    const key = tenantId;
    if (!key) throw new Error(`Missing secret for tenant: ${tenantId}`);
    return Buffer.from(key, "hex");
};

export const encryptToken = (token: TokenPayload): string => {
    const key = getKey(process.env.ENCRYPTION_KEY!);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const encrypted = Buffer.concat([
        cipher.update(token, "utf8"),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    const result: EncryptedData = {
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
        content: encrypted.toString("hex"),
    };

    return Buffer.from(JSON.stringify(result)).toString("base64");
};

export const decryptToken = (encryptedToken: string): string => {
    const key = getKey(process.env.ENCRYPTION_KEY!);
    const decoded = JSON.parse(
        Buffer.from(encryptedToken, "base64").toString("utf8")
    ) as EncryptedData;

    const iv = Buffer.from(decoded.iv, "hex");
    const tag = Buffer.from(decoded.tag, "hex");
    const content = Buffer.from(decoded.content, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(content),
        decipher.final(),
    ]);

    return decrypted.toString("utf8");
};
