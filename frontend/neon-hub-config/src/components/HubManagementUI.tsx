import React, { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";

type ConfigSection = {
  [key: string]: string | number | string[] | object;
};

type Config = {
  hana: ConfigSection;
  MQ: ConfigSection;
  iris: ConfigSection;
  websocket: ConfigSection;
  logging: ConfigSection;
  units: ConfigSection;
  location: ConfigSection;
  skills: {
    default_skills: string[];
    extra_dependencies: {
      [key: string]: string[];
    };
  };
  api_keys: ConfigSection;
};

interface HubManagementUIProps {
  isDark: boolean;
}

const HubManagementUI: React.FC<HubManagementUIProps> = ({ isDark }) => {
  const [config, setConfig] = useState<Config>({
    hana: { fastapi_title: "My HANA API Host", fastapi_summary: "Personal HTTP API to access my DIANA backend.", enable_email: "false", node_username: "neon_node", node_password: "sh574h57ytrgierj4ht5iyrt" },
    MQ: { port: 5672, server: "neon-rabbitmq" },
    iris: { default_lang: "en-us", languages: ["en-us"], webui_chatbot_label: "Neon AI", webui_mic_label: "Speak with Neon", webui_input_placeholder: "Speak with Neon", webui_ws_url: "wss://iris-websat.neon-hub.local/ws" },
    websocket: { host: "neon-messagebus" },
    logging: { LOG_LEVEL: "INFO" },
    units: { system_unit: "imperial", time_format: "half" },
    location: { timezone: "America/Los_Angeles" },
    skills: {
      default_skills: ["neon-skill-alerts"],
      extra_dependencies: {
        global: ["requests"],
        skills: ["neon-skill-alerts"],
        voice: ["ovos-stt-server"],
        audio: ["ovos-tts-plugin-beepspeak"],
        enclosure: ["ovos-PHAL-plugin-homeassistant"],
      },
    },
    api_keys: { alpha_vantage: "", open_weather_map: "", wolfram_alpha: "" },
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);


  const handleConfigChange = (section: keyof Config, key: string, value: string | number | string[] | object) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const fetchConfig = () => {
    // TODO: Implement fetchConfig function from API
    setLastRefresh(new Date());
  };
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-orange-400" : "border-orange-600";
  const cardBgColor = isDark ? "bg-gray-800" : "bg-orange-100";
  const inputBgColor = isDark ? "bg-gray-700" : "bg-white";
  const inputBorderColor = isDark ? "border-orange-400" : "border-orange-600";
  const linkColor = isDark ? "text-orange-400" : "text-orange-600";

  const renderConfigSection = (section: keyof Config, data: ConfigSection, title: string) => (
    <div className={`mb-4 border ${borderColor} rounded-lg overflow-hidden`}>
      <div className={`${cardBgColor} p-4`}>
        <h2 className={`text-xl font-semibold ${isDark?'text-orange-200':'text-orange-800'}`}>{title}</h2>
      </div>
      <div className={`${bgColor} p-4`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium mb-1">{key}</label>
            {key === 'LOG_LEVEL' ? (
              <>
                <select 
                  value={value as string} 
                  onChange={(e) => handleConfigChange(section, key, e.target.value)} 
                  className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
                >
                  {['DEBUG','INFO','WARNING','ERROR','CRITICAL'].map(level => 
                    <option key={level} value={level}>{level}</option>
                  )}
                </select>
                <a href="https://docs.python.org/3/library/logging.html#logging-levels" target="_blank" rel="noopener noreferrer" className={`text-sm ${linkColor} hover:underline flex items-center mt-1`}>
                  View LOG_LEVEL documentation <ExternalLink className="ml-1 h-3 w-3"/>
                </a>
              </>
            ) : key === 'system_unit' ? (
              <>
                <select 
                  value={value as string} 
                  onChange={(e) => handleConfigChange(section, key, e.target.value)} 
                  className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
                <span className="text-sm mt-1 block">
                  Example: {(value as string) === 'metric' ? 'metric (uses kilometers, Celsius)' : 'imperial (uses miles, Fahrenheit)'}
                </span>
              </>
            ) : key === 'time_format' ? (
              <>
                <select 
                  value={value as string} 
                  onChange={(e) => handleConfigChange(section, key, e.target.value)} 
                  className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
                >
                  <option value="half">12-hour</option>
                  <option value="full">24-hour</option>
                </select>
                <span className="text-sm mt-1 block">
                  Example: {(value as string) === 'half' ? 'half (12-hour format, e.g., 3:00 PM)' : 'full (24-hour format, e.g., 15:00)'}
                </span>
              </>
            ) : key === 'timezone' ? (
              <>
                <input 
                  type="text" 
                  value={value as string} 
                  onChange={(e) => handleConfigChange(section, key, e.target.value)} 
                  className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
                />
                <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones" target="_blank" rel="noopener noreferrer" className={`text-sm ${linkColor} hover:underline flex items-center mt-1`}>
                  View list of valid timezones <ExternalLink className="ml-1 h-3 w-3"/>
                </a>
              </>
            ) : (
              <input 
                type={typeof value === 'number' ? 'number' : 'text'} 
                value={value as string | number} 
                onChange={(e) => handleConfigChange(section, key, e.target.value)} 
                className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
  // const renderSkillsSection = () => (
  //   <div className={`mb-4 border ${borderColor} rounded-lg overflow-hidden`}>
  //     <div className={`${cardBgColor} p-4`}>
  //       <h2
  //         className={`text-xl font-semibold ${
  //           isDark ? "text-orange-200" : "text-orange-800"
  //         }`}
  //       >
  //         Skills and Dependencies
  //       </h2>
  //     </div>
  //     <div className={`${bgColor} p-4`}>
  //       <div className="mb-4">
  //         <label className="block text-sm font-medium mb-1">
  //           Default Skills
  //         </label>
  //         <input
  //           value={config.skills.default_skills.join(", ")}
  //           onChange={(e) =>
  //             handleConfigChange(
  //               "skills",
  //               "default_skills",
  //               e.target.value.split(", ").filter(Boolean)
  //             )
  //           }
  //           className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
  //         />
  //       </div>
  //       {Object.entries(config.skills.extra_dependencies).map(
  //         ([key, value]) => (
  //           <div key={key} className="mb-4">
  //             <label className="block text-sm font-medium mb-1">
  //               {key} Dependencies
  //             </label>
  //             <input
  //               value={value.join(", ")}
  //               onChange={(e) => {
  //                 const newDeps = {
  //                   ...config.skills.extra_dependencies,
  //                   [key]: e.target.value.split(", ").filter(Boolean),
  //                 };
  //                 handleConfigChange("skills", "extra_dependencies", newDeps);
  //               }}
  //               className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
  //             />
  //           </div>
  //         )
  //       )}
  //     </div>
  //   </div>
  // );
  const renderApiKeysSection = () => (
    <div className={`mb-4 border ${borderColor} rounded-lg overflow-hidden`}>
      <div className={`${cardBgColor} p-4`}>
        <h2
          className={`text-xl font-semibold ${
            isDark ? "text-orange-200" : "text-orange-800"
          }`}
        >
          External API Keys
        </h2>
      </div>
      <div className={`${bgColor} p-4`}>
        {Object.entries(config.api_keys).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </label>
            <input
              type="password"
              value={value as string}
              onChange={(e) =>
                handleConfigChange("api_keys", key, e.target.value)
              }
              className={`w-full p-2 rounded ${inputBgColor} ${textColor} border ${inputBorderColor}`}
            />
            <a
              href={
                key === "alpha_vantage"
                  ? "https://www.alphavantage.co/support/#api-key"
                  : key === "open_weather_map"
                  ? "https://home.openweathermap.org/appid"
                  : key === "wolfram_alpha"
                  ? "https://products.wolframalpha.com/api/"
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm ${linkColor} hover:underline flex items-center mt-1`}
            >
              Get{" "}
              {key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}{" "}
              API key <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className={`p-4 ${bgColor} ${textColor} min-h-screen`}>
      <div className="container mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={fetchConfig}
            className={`flex items-center p-2 rounded ${
              isDark
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-orange-500 hover:bg-orange-600"
            } text-white`}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Configuration
          </button>
          {lastRefresh && (
            <span className="text-sm">
              Last refreshed: {lastRefresh?.toLocaleString() || Date()}
            </span>
          )}
        </div>
        {renderConfigSection(
          "logging",
          config.logging,
          "Logging Configuration"
        )}
        {renderConfigSection("units", config.units, "Units of Measurement")}
        {renderConfigSection("location", config.location, "Location Settings")}
        {renderApiKeysSection()}
        {renderConfigSection("hana", config.hana, "HANA Configuration")}
        {/* {renderConfigSection("MQ", config.MQ, "Message Queue Configuration")} // TODO: Do we want to display this section? */}
        {renderConfigSection("iris", config.iris, "IRIS Configuration")}
        {/* {renderConfigSection(
          "websocket",
          config.websocket,
          "WebSocket Configuration"
        )} */}
        {/* {renderSkillsSection()} */}
      </div>
    </div>
  );
};
export default HubManagementUI;
