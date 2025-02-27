import jwt from "jsonwebtoken";
const { verify } = jwt; 


export function authenticateUser(req, res, next) {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = verify(token.replace("Bearer ", ""), process.env.ACCESS_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
}
