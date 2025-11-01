import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineCog, HiOutlineClock } from 'react-icons/hi'; // Icons for new features

// Your backend URL
const BACKEND_URL = 'http://localhost:3000';

export default function DashboardPage() {
  const navigate = useNavigate();

  // --- 1. State for On-Demand Data ---
  const [loginHistory, setLoginHistory] = useState([]); // Will hold our fetched list
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');

  // --- 2. Get User Info from localStorage ---
  let userEmail = 'User';
  let userWallet = '';
  const userString = localStorage.getItem('user');
  
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userEmail = user.email;
      userWallet = user.publicAddress;
    } catch (e) { console.error("Failed to parse user", e); }
  }

  // --- 3. Logout Function ---
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  // --- 4. NEW: Fetch Login History ---
  const handleFetchHistory = async () => {
    setIsLoadingHistory(true);
    setHistoryError('');
    setLoginHistory([]); // Clear old results

    // Get the auth token to prove who we are
    const token = localStorage.getItem('authToken');

    if (!token) {
      setHistoryError('No auth token found. Please log in again.');
      setIsLoadingHistory(false);
      return;
    }

    try {
      // This is a new protected endpoint you will need to create
      const response = await fetch(`${BACKEND_URL}/api/login-history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // --- This header is critical ---
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history. Please try again.');
      }

      const data = await response.json();
      setLoginHistory(data.logins); // Assuming backend sends { logins: [...] }

    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // --- 5. The Page Component (JSX) ---
  return (
    <div className="w-full max-w-5xl mx-auto p-8 text-white">
      
      {/* Header Section with Logout Button */}
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          VeriChain
        </h1>
        <button
          onClick={handleLogout}
          className="py-2 px-5 font-semibold rounded-lg shadow-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Log Out
        </button>
      </header>

      {/* Welcome Message */}
      <div className="bg-gray-800 p-8 shadow-xl rounded-2xl w-full mb-8">
        <h2 className="text-3xl font-bold mb-6">
          Welcome, <span className="text-blue-400">{userEmail}</span>
        </h2>
        <p className="text-lg text-gray-300">
          You have successfully logged in. This is your secure dashboard.
        </p>
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <p className="text-sm text-gray-400">Your associated wallet:</p>
          <strong className="text-base text-gray-200 break-words">{userWallet}</strong>
        </div>
      </div>

      {/* --- NEW: Feature Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Login History */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          <HiOutlineClock className="h-10 w-10 text-blue-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Login History</h3>
          <p className="text-gray-400 mb-4">View recent login activity for your account.</p>
          <button
            onClick={handleFetchHistory}
            disabled={isLoadingHistory}
            className="w-full py-2 px-4 font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500"
          >
            {isLoadingHistory ? 'Loading...' : 'Show History'}
          </button>
        </div>
        
        {/* Card 2: Placeholder */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg opacity-60">
          <HiOutlineUser className="h-10 w-10 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Manage Profile</h3>
          <p className="text-gray-400 mb-4">Update your email, password, or other personal details.</p>
          <button disabled className="w-full py-2 px-4 font-semibold rounded-lg text-white bg-gray-600 cursor-not-allowed">
            Coming Soon
          </button>
        </div>

        {/* Card 3: Placeholder */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg opacity-60">
          <HiOutlineCog className="h-10 w-10 text-gray-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Account Settings</h3>
          <p className="text-gray-400 mb-4">Manage 2FA, notification preferences, and more.</p>
          <button disabled className="w-full py-2 px-4 font-semibold rounded-lg text-white bg-gray-600 cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>

      {/* --- NEW: Login History Display Area --- */}
      {/* This section will only appear if the history array has items in it */}
      {loginHistory.length > 0 && (
        <div className="bg-gray-800 p-8 shadow-xl rounded-2xl w-full">
          <h3 className="text-2xl font-bold mb-4">Your Login History</h3>
          <ul className="divide-y divide-gray-700">
            {/* We map over the array and create a list item for each login */}
            {loginHistory.map((login, index) => (
              <li key={index} className="py-3 flex justify-between items-center">
                <span className="text-gray-300">
                  Logged in from: {login.publicAddress || 'Unknown IP'}
                </span>
                <span className="text-sm text-gray-400">
                  {/* Format the date to be readable */}
                  {new Date(login.timestamp).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show an error if fetching fails */}
      {historyError && (
        <div className="bg-red-800 p-4 rounded-lg text-red-100 text-center">
          {historyError}
        </div>
      )}

    </div>
  );
}