// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // This adds the user's ID to the request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

export default authMiddleware;