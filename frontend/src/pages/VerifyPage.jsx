import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineExclamation } from 'react-icons/hi';

const BACKEND_URL = 'http://localhost:3000';

export default function VerifyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the data we passed from the Login page
  const email = location.state?.email;
  const associatedAddress = location.state?.associatedAddress; // 👈 --- NEW

  // If data is missing, redirect back to login
  if (!email || !associatedAddress) {
    // This will stop the page from crashing if you visit /verify directly
    // We use a small timeout to let the navigate() function run properly
    setTimeout(() => navigate('/'), 0); 
    return null; // Don't render anything
  }

  const handleVerify = async () => {
    setIsLoading(true);
    toast('Please connect your wallet...', { icon: '🔑' });

    if (!window.ethereum) {
      toast.error('MetaMask is not installed.');
      setIsLoading(false);
      return;
    }

    let provider, signer, connectedAddress;
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      signer = await provider.getSigner();
      connectedAddress = await signer.getAddress();
    } catch  {
      toast.error('Wallet connection rejected.');
      setIsLoading(false);
      return;
    }

    // 👇 --- THIS IS THE NEW SECURITY CHECK --- 👇
    
    // ------------------------------------------

    toast('Wallet connected!', { icon: '✅' });

    try {
      // 2. Request Nonce from Backend
      toast('Requesting challenge...', { icon: '...'});
      const nonceRes = await fetch(`${BACKEND_URL}/request-nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicAddress: connectedAddress }), // Use the connected address
      });
      const { messageToSign } = await nonceRes.json();

      // 3. Sign the Nonce
      toast('Please sign the message...', { icon: '✍️' });
      let signature;
      try {
        signature = await signer.signMessage(messageToSign);
      } catch  {
        toast.error('Message signing rejected.');
        setIsLoading(false);
        return;
      }

      // 4. Verify Signature with Backend
      toast('Verifying signature...', { icon: '...'});
      const verifyRes = await fetch(`${BACKEND_URL}/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicAddress: connectedAddress, signature }),
      });

      // 4. Verify Signature with Backend
      // ... (fetch code) ...
      const verifyData = await verifyRes.json();

      // --- 👇 THIS IS THE UPDATED LOGIC 👇 ---

      // Check 1: Did the backend say the signature was valid?
      if (!verifyRes.ok || !verifyData.token) {
        toast.error(verifyData.message || 'Signature verification failed.');
        setIsLoading(false);
        return;
      }

      // Check 2: Was the valid signature from the CORRECT wallet?
      if (connectedAddress.toLowerCase() !== associatedAddress.toLowerCase()) {
        // This is the error you wanted!
        toast.error('Verification unsuccessful. Signed with the wrong wallet.');
        setIsLoading(false);
        // --- ADD THESE LINES ---
        // This waits 2 seconds for the user to read the error,
        // then redirects them to the login page.
        setTimeout(() => {
          navigate('/'); 
        }, 2000); 
        // -----------------------
        return;
      }
      
      // 5. SUCCESS! (Both valid and correct wallet)
      toast.success('Verification Successful! Redirecting...');
      // We can now safely store the *correct* address
      localStorage.setItem('authToken', verifyData.token);
      localStorage.setItem('user', JSON.stringify({ email, publicAddress: associatedAddress }));

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Verification error:', err);
      toast.error('An error occurred during verification.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 shadow-xl rounded-2xl w-full max-w-md text-center">
      <Toaster position="top-right" />
      
      <div className="flex justify-center mb-4">
        <HiOutlineShieldCheck className="h-16 w-16 text-blue-400" />
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">
        Verify Your Identity
      </h2>
      <p className="text-gray-400 mb-6">
        Please sign a message with the wallet associated with this account.
      </p>
      
      {/* Display the account info */}
      <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
        <p className="text-sm text-gray-300">
          Account: <strong className="text-white break-words">{email}</strong>
        </p>
        <p className="text-sm text-gray-300 mt-2">
          Required Wallet: <strong className="text-white break-words">{associatedAddress.substring(0, 6)}...{associatedAddress.substring(associatedAddress.length - 4)}</strong>
        </p>
      </div>

      <div>
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent 
                     rounded-md shadow-sm text-lg font-medium text-white 
                     bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     disabled:bg-gray-500"
        >
          {isLoading ? 'Verifying...' : 'Verify with Wallet'}
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        This is a gas-free action. You are only signing a message.
      </p>
    </div>
  );
}