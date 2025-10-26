import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "secret-key"; // کلید مخفی

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}
