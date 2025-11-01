// At the top of your routes file
import LoginHistory from './models/LoginHistory.js'; // Import the new model
import authMiddleware from './middleware/authMiddleware.js'; // Import the new middleware

// Make sure 'User', 'jwt', and 'express' are also imported

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

const nonceStore = new Map();
const userStore = new Map();
// Helper function to find a user in the Map by their address
function findUserByAddress(publicAddress) {
  const addressToFind = publicAddress.toLowerCase();
  
  // Iterate over all values (user objects) in the map
  for (const user of userStore.values()) {
    if (user.publicAddress.toLowerCase() === addressToFind) {
      return user; // Return the user object if found
    }
  }
  return undefined; // Not found
}
// ---------------------------

app.get('/', (req, res) => {
  res.send('Hello from the VeriChain Backend!');
});

// 👇 --- MODIFIED /REGISTER ENDPOINT --- 👇
app.post('/register', (req, res) => {
  // Now we expect a publicAddress
  const { email, password, publicAddress } = req.body;

  if (!email || !password || !publicAddress) {
    return res.status(400).send('Email, password, and publicAddress are required.');
  }
  if (userStore.has(email)) {
    return res.status(409).send('User already exists.');
  }

  // Store the publicAddress with the user
  userStore.set(email, { email, password, publicAddress });

  console.log('New user registered:', { email, publicAddress });
  console.log('Current user list:', userStore);

  res.status(201).json({ success: true, message: 'User registered successfully.' });
});
// -------------------------------------

// 👇 --- MODIFIED /LOGIN ENDPOINT --- 👇
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }
  const user = userStore.get(email);
  if (!user) {
    return res.status(404).send('User not found.');
  }
  if (user.password !== password) {
    return res.status(401).send('Invalid password.');
  }

  // Password is correct.
  // Send back the user's registered wallet address.
  console.log(`User ${email} verified, sending associated address: ${user.publicAddress}`);
  res.json({
    success: true,
    message: 'Password verified. Proceed to wallet verification.',
    associatedAddress: user.publicAddress // 👈 --- THIS IS THE KEY ---
  });
});
// -------------------------------------

// --- (Your /request-nonce and /verify-signature endpoints are unchanged) ---
// --- 👇 REPLACE YOUR /request-nonce WITH THIS ---
app.post('/request-nonce', (req, res) => {
  const { publicAddress } = req.body;
  if (!publicAddress) {
    return res.status(400).send('publicAddress is required');
  }

  // --- FIX: Check if user exists first ---
  const user = findUserByAddress(publicAddress);
  if (!user) {
    return res.status(404).send('User not found for this address. Please register first.');
  }
  // --- END FIX ---

  const nonce = crypto.randomBytes(32).toString('hex');
  const messageToSign = `Welcome! Please sign this message to log in. Nonce: ${nonce}`;
  
  nonceStore.set(publicAddress, messageToSign); // This part is fine
  
  res.json({ messageToSign });
});

app.post('/verify-signature', async(req, res) => {
  const { publicAddress, signature } = req.body;
  const originalMessage = nonceStore.get(publicAddress);
  
  if (!originalMessage) {
    return res.status(400).send('No nonce found. Please request a new one.');
  }
  
  try {
    const recoveredAddress = ethers.verifyMessage(originalMessage, signature);
    
    if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
      nonceStore.delete(publicAddress);
      
      // This line is correct
      const userEmail = Array.from(userStore.values()).find(
        user => user.publicAddress.toLowerCase() === publicAddress.toLowerCase()
      )?.email || 'unknown';

      // --- FIX: Use 'userEmail' not 'email' ---
      const token = jwt.sign(
        { publicAddress: publicAddress, email: userEmail }, // <-- THE FIX
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      // --- END FIX ---
      
      // Save the login event to the history
      try {
        const loginRecord = new LoginHistory({
          publicAddress: publicAddress, // <-- Use the publicAddress directly
          ipAddress: req.ip, 
        });
        await loginRecord.save();
      } catch (dbError) {
        console.error("Failed to save login history:", dbError);
      }
      
      res.json({
        success: true,
        message: 'Login successful!',
        token: token,
      });
    } else {
      res.status(401).send('Signature verification failed.');
    }
  } catch (error) {
    console.error("Verification error:", error); // Log the actual error
    res.status(500).send('An error occurred during verification.');
  }
});
// --- 👇 ADD THIS ENTIRE NEW ROUTE ---
// This route is protected by the authMiddleware
app.get('/api/login-history', authMiddleware, async (req, res) => {
  try {
    // req.user now contains the { publicAddress, email } from the token
    const userAddress = req.user.publicAddress; 

    const logins = await LoginHistory.find({ publicAddress: userAddress }) // <-- Find by publicAddress
                                     .sort({ timestamp: -1 }) 
                                     .limit(10);
    
    res.json({ logins: logins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

//

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});