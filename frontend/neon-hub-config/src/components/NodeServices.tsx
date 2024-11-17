import React from "react";

interface NodeServicesProps {
  isDark: boolean;
}
const NodeServices: React.FC<NodeServicesProps> = ({ isDark }) => {
  console.debug("NodeServicesProps", isDark);
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Node Services
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
      This feature is currently under development. It will provide functionality for managing local Neon Node services.
      </p>
      {/* Add implementation for Node Services management here */}
    </div>
  );
};

export default NodeServices;
