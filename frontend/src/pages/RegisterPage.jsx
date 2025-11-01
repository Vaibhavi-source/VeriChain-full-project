import { useState } from 'react'; // 👈 --- Import useState
import { Link, useNavigate } from 'react-router-dom'; // 👈 --- Import useNavigate
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { Toaster, toast } from 'react-hot-toast'; // 👈 --- Import Toaster & toast

// This is the URL of the backend we just updated
const BACKEND_URL = 'http://localhost:3000';

export default function RegisterPage() {
  // --- NEW: State variables to hold form data ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [publicAddress, setPublicAddress] = useState('');
  const navigate = useNavigate(); // Hook to redirect user
  
  // ---------------------------------------------
  const handleWalletConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setPublicAddress(account);
        toast.success(`Wallet connected: ${account.substring(0, 6)}...`);
      } catch (error) {
        console.error("Error connecting wallet", error);
        toast.error("Wallet connection failed.");
      }
    } else {
      toast.error("Please install MetaMask.");
    }
  };

  // --- NEW: Functional handleSubmit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Check if passwords match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    // 👈 --- ADD THIS CHECK ---
    // 2. Check if wallet is connected
    if (!publicAddress) {
      toast.error('Please connect your wallet first.');
      setIsLoading(false);
      return;
    }
    // -------------------------

    console.log('Attempting to fetch from:', `${BACKEND_URL}/register`);

    // 2. Try to register
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, publicAddress }),
      });

      // We read the text from the response first
      const dataText = await response.text();

      if (response.ok) {
        // Success!
        toast.success('User registered successfully!');
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/'); // Navigate to login page
        }, 2000);
      } else {
        // Handle errors (like 'User already exists')
        toast.error(dataText || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // ------------------------------------

  return (
    <div className="bg-gray-800 p-8 shadow-xl rounded-2xl w-full max-w-md">
      {/* This <Toaster /> component is required for toasts to show up */}
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-center mb-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          VeriChain
        </h1>
      </div>
      <h2 className="text-3xl font-bold text-center text-white mb-6">
        Create an Account
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={email} // 👈 --- Bind to state
              onChange={(e) => setEmail(e.target.value)} // 👈 --- Update state
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={password} // 👈 --- Bind to state
              onChange={(e) => setPassword(e.target.value)} // 👈 --- Update state
            />
          </div>
        </div>

        {/* Confirm Password Input */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
            Confirm Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirm-password"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={confirmPassword} // 👈 --- Bind to state
              onChange={(e) => setConfirmPassword(e.target.value)} // 👈 --- Update state
            />
          </div>
        </div>

        {/* 👈 --- ADD THIS ENTIRE BLOCK --- */}
      <div>
        <button
          type="button" // Important: type="button" so it doesn't submit
          onClick={handleWalletConnect}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                     bg-gray-600 hover:bg-gray-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          {publicAddress 
            ? `Connected: ${publicAddress.substring(0, 6)}...` 
            : 'Connect Wallet'}
        </button>
      </div>
      {/* ---------------------------------- */}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading} // 👈 --- Disable button when loading
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                       bg-blue-600 hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                       disabled:bg-gray-500" // 👈 --- Add disabled style
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>

      {/* Footer Link */}
      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/" className="font-medium text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}