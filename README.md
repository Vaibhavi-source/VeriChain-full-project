A complete, full-stack web application demonstrating a secure, two-factor authentication flow using a traditional email/password login combined with a cryptographic wallet signature (Sign-in with Ethereum).

✨ Features
Combined Auth: Secure user registration that links an email/password to a specific wallet address.

2-Factor Login:

Factor 1: Verifies user with email and password.

Factor 2: Verifies wallet ownership by requiring a signed message (a "nonce").

Secure Backend: Built with Node.js & Express, using JSON Web Tokens (JWT) for session management.

Protected Routes: Frontend dashboard is fully protected. Unauthorized users are redirected to the login page.

Login History: Successfully authenticated logins are recorded in a MongoDB database.

Monorepo Structure: Frontend and backend code are organized in a single repository.

🛠️ Tech Stack
This project is a monorepo containing two separate applications:

1. Frontend (/frontend)
Framework: React

Routing: React Router

Styling: Tailwind CSS

Wallet Connection: Ethers.js (to connect to MetaMask)

Notifications: react-hot-toast

2. Backend (/backend)
Runtime: Node.js

Framework: Express

Database: MongoDB (using Mongoose) to store login history.

User Store: In-memory Map for fast user lookups.

Authentication: JSON Web Tokens (JWT)

Crypto: ethers.js (for signature verification) & crypto (for nonce generation)

🚀 How to Run This Project
You will need to run both the frontend and backend applications in two separate terminals.

Prerequisites
Node.js (v18 or later)

MongoDB (You must have the MongoDB Community Server installed and running on your computer)
