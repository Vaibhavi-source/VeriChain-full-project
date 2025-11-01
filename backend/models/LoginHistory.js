// models/LoginHistory.js
// models/LoginHistory.js
import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  // We changed this from 'userId' to 'publicAddress'
  publicAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true, // This makes lookups faster
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
});

const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
export default LoginHistory;