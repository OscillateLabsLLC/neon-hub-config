import React from "react";
import { useAuth } from "../context/AuthContext";


const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return (
    <button 
      onClick={logout}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-red-500"
    >
      Logout
    </button>
  );
};

export default LogoutButton;