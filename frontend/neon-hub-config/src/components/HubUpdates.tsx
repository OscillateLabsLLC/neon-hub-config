import React from "react";

interface SystemUpdatesProps {
    isDark: boolean;
}
const HubUpdates: React.FC<SystemUpdatesProps> = ({isDark}) => {
  console.log("SystemUpdatesProps", isDark);
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">System Updates</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Hub services and updates are managed through Yacht. Please refer to the{" "}
        <a
          href="https://neongeckocom.github.io/neon-hub-installer/services/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Yacht interface
        </a>{" "}
        for enabling and modifying services.
      </p>
      {/* Add implementation for System Updates management here */}
    </div>
  );
};

export default HubUpdates;