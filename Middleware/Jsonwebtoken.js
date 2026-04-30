import { configDotenv } from "dotenv";
configDotenv();
import joi from 'joi';
import jwt from "jsonwebtoken";
import ErrorHandler from "../Error/ErrorHandler.js";

const SECRET = process.env.JWT_SECRET;

class Jsonwebtoken {
  static tokenSchema = joi.object({
    authorization: joi.string()
      .pattern(/^Bearer\s+[\w-]*\.[\w-]*\.[\w-]*$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid token format',
        'any.required': 'No token provided'
      })
  });

  static generate(payload, expire="1d") {
    return jwt.sign(payload, SECRET, { expiresIn: expire });
  }

  static verify(req, res, next) {
    try {
      const authHeader = req.headers["authorization"];
      const { error } = Jsonwebtoken.tokenSchema.validate({ authorization: authHeader }, { abortEarly: true });
      if (error) return ErrorHandler.Error400(res, error.details[0].message);
      
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, SECRET);
      req.token = decoded;
      next();
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return ErrorHandler.Error400(res, "Invalid or expired token");
    }
  }

  static verifyToken(token) {
    return jwt.verify(token, SECRET);
  }

  static verifyAdmin(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return ErrorHandler.Error400(res, "No token provided");
      
      const decoded = Jsonwebtoken.verifyToken(token);
      if (decoded.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
      
      req.admin = decoded;
      next();
    } catch (err) {
      console.error("Admin verification failed:", err.message);
      return ErrorHandler.Error400(res, "Invalid or expired token");
    }
  }
}

export default Jsonwebtoken

