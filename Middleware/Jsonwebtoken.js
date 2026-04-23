import { configDotenv } from "dotenv";
configDotenv()
import jwt from "jsonwebtoken";
import ErrorHandler from "../Error/ErrorHandler.js";

const SECRET = process.env.JWT_SECRET

class Jsonwebtoken{
  static generate(payload, expire="1d") {
    return jwt.sign(payload, SECRET, {expiresIn: expire})
  }

  static verify(req, res, next) {
    const authHeader = req.headers["authorization"]
    if (!authHeader || !authHeader.startsWith("Bearer ")) 
      return ErrorHandler.Error400(res, "No token provided")
    const token = authHeader.split(" ")[1]
    try {
      const decoded = jwt.verify(token, SECRET)
      req.token = decoded
      next()
    } catch (err) {
      console.error("Token verification failed:", err.message)
      return ErrorHandler.Error400(res,  "Invalid or expired token")
    }
  }
}

export default Jsonwebtoken

