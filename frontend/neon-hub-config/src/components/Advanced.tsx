import React from "react";
import YAMLEditors from "./YAMLEditors";
import { api } from "../lib/utils";

interface AdvancedProps {
    isDark: boolean;
}
const Advanced: React.FC<AdvancedProps> = ({isDark}) => {
  console.log("AdvancedProps", isDark);
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Advanced</h2>
      <YAMLEditors isDark={isDark} baseUrl={api.getBaseUrl()} />
    </div>
  );
};

export default Advanced;