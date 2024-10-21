import React from "react";

interface SystemUpdatesProps {
    isDark: boolean;
}
const SystemUpdates: React.FC<SystemUpdatesProps> = ({isDark}) => {
  console.log("SystemUpdatesProps", isDark);
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">System Updates</h2>
      <p className="text-gray-600 dark:text-gray-300">
        This feature is currently under development. It will provide functionality for managing system updates.
      </p>
      {/* Add implementation for System Updates management here */}
    </div>
  );
};

export default SystemUpdates;