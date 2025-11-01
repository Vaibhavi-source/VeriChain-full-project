import { Outlet } from 'react-router-dom';
import './App.css';

function App() {
  return (
    // This is our main app shell
    // We'll use a dark theme for the whole app
    <div className="animated-gradient min-h-screen text-white flex items-center justify-center font-sans">
      {/* The <Outlet /> component is a placeholder where 
          React Router will render the current page 
          (e.g., LoginPage, DashboardPage, etc.) */}
      <Outlet />
      
    </div>
  );
}

export default App;