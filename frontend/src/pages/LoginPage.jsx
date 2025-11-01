import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import { Toaster, toast } from 'react-hot-toast';

const BACKEND_URL = 'http://localhost:3000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password verified!');
        setTimeout(() => {
          navigate('/verify', {
            state: {
              email: email,
              associatedAddress: data.associatedAddress,
            },
          });
        }, 1000);
      } else {
        toast.error(data.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-10 shadow-2xl rounded-3xl w-full max-w-lg transform scale-105 transition-all duration-300">
      <Toaster position="top-right" />

      <div className="flex justify-center mb-6">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
          VeriChain
        </h1>
      </div>

      <h2 className="text-3xl font-bold text-center text-white mb-8">
        Log In
      </h2>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-base font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative flex items-center">
            <HiOutlineMail className="absolute left-3 text-gray-400 text-2xl pointer-events-none" />
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              className="block w-full pl-12 pr-3 py-3 text-lg border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-base font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative flex items-center">
            <HiOutlineLockClosed className="absolute left-3 text-gray-400 text-2xl pointer-events-none" />
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="block w-full pl-12 pr-3 py-3 text-lg border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 text-lg font-semibold rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 transition-all"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-base text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}
