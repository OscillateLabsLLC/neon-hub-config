import React, { useState } from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import SecretField from "./SecretField";

interface TooltipInterface {
  [key: string]: string;
}

const TOOLTIPS: TooltipInterface = {
  LOG_LEVEL: "The level of logging to be used by the backend. Supports Python logging levels.",
  system_unit: "The system of measurement to be used by the backend. Options: metric, imperial.",
  time_format: "The format for displaying time. Options: half (12-hour format), full (24-hour format).",
  timezone: "The timezone to be used by the backend. Must be a valid timezone string.",
  default_lang: "The default language to be used by the IRIS web interface.",
  languages: "The languages supported by the IRIS web interface.",
  webui_chatbot_label: "The title in the IRIS web interface.",
  webui_mic_label: "The label for the microphone button in the IRIS web interface.",
  webui_input_placeholder: "The placeholder text for the chat input in the IRIS web interface.",
  webui_ws_url: "The WebSocket URL for the IRIS web interface, e.g. wss://<your-hub-ip>/ws. Must be wss for IRIS websat.",
  fastapi_title: "The title of the HANA instance.",
  fastapi_summary: "The summary text of the HANA instance.",
  enable_email: "Whether to enable email functionality in the backend.",
  node_username: "The username for connecting a Neon Node to your Neon Hub.",
  node_password: "The password for connecting a Neon Node to your Neon Hub.",
  port: "The port to be used by the Message Queue.",
};

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

const snakeCaseToTitle = (str: string) => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const HubManagementUI: React.FC<HubManagementUIProps> = ({ isDark }) => {
  const [config, setConfig] = useState<Config>({
    hana: {
      fastapi_title: "My HANA API Host",
      fastapi_summary: "Personal HTTP API to access my DIANA backend.",
      enable_email: "false",
      node_username: "neon_node",
      node_password: "sh574h57ytrgierj4ht5iyrt"
    },
    MQ: { port: 5672, server: "neon-rabbitmq" },
    iris: {
      default_lang: "en-us",
      languages: ["en-us"],
      webui_chatbot_label: "Neon AI",
      webui_mic_label: "Speak with Neon",
      webui_input_placeholder: "Speak with Neon",
      webui_ws_url: "wss://iris-websat.neon-hub.local/ws"
    },
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
    api_keys: {
      alpha_vantage: "",
      open_weather_map: "",
      wolfram_alpha: ""
    },
  });
  
  const [lastRefresh, setLastRefresh] = useState<Date | null>(new Date());

  const handleConfigChange = (
    section: keyof Config,
    key: string,
    value: string | number | string[] | object
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const isSecret = (section: keyof Config, key: string): boolean => {
    return (
      key.includes("password") ||
      key.includes("secret") ||
      key.includes("api_key") ||
      section === "api_keys"
    );
  };

  const renderInputField = (
    section: keyof Config,
    key: string,
    value: unknown
  ) => {
    const baseInputClass = `w-full p-2 rounded ${
      isDark ? "bg-gray-700" : "bg-white"
    } ${isDark ? "text-white" : "text-gray-900"} border ${
      isDark ? "border-orange-400" : "border-orange-600"
    }`;

    if (isSecret(section, key)) {
      return (
        <SecretField
          value={value as string}
          onChange={(e) => handleConfigChange(section, key, e.target.value)}
          className={baseInputClass}
          isDark={isDark}
        />
      );
    }

    if (key === "LOG_LEVEL") {
      return (
        <select
          value={value as string}
          onChange={(e) => handleConfigChange(section, key, e.target.value)}
          className={baseInputClass}
        >
          {["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      );
    }

    if (key === "system_unit") {
      return (
        <select
          value={value as string}
          onChange={(e) => handleConfigChange(section, key, e.target.value)}
          className={baseInputClass}
        >
          <option value="metric">Metric</option>
          <option value="imperial">Imperial</option>
        </select>
      );
    }

    if (key === "time_format") {
      return (
        <select
          value={value as string}
          onChange={(e) => handleConfigChange(section, key, e.target.value)}
          className={baseInputClass}
        >
          <option value="half">12-hour</option>
          <option value="full">24-hour</option>
        </select>
      );
    }

    return (
      <input
        type={typeof value === "number" ? "number" : "text"}
        value={value as string | number}
        onChange={(e) => handleConfigChange(section, key, e.target.value)}
        className={baseInputClass}
      />
    );
  };

  const fetchConfig = () => {
    // TODO: Implement fetchConfig function from API
    setLastRefresh(new Date());
  };

  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-orange-400" : "border-orange-600";
  const cardBgColor = isDark ? "bg-gray-800" : "bg-orange-100";
  const linkColor = isDark ? "text-orange-400" : "text-orange-600";

  const renderConfigSection = (
    section: keyof Config,
    data: ConfigSection,
    title: string
  ) => (
    <div className={`mb-4 border ${borderColor} rounded-lg overflow-hidden`}>
      <div className={`${cardBgColor} p-4`}>
        <h2
          className={`text-xl font-semibold ${
            isDark ? "text-orange-200" : "text-orange-800"
          }`}
        >
          {title}
        </h2>
      </div>
      <div className={`${bgColor} p-4`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="mb-4">
            {TOOLTIPS[key] ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="block text-sm font-medium mb-1 cursor-help">
                      {snakeCaseToTitle(key.toLowerCase())}
                      <span className="ml-1 text-gray-400">ⓘ</span>
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{TOOLTIPS[key]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <label className="block text-sm font-medium mb-1">
                {snakeCaseToTitle(key.toLowerCase())}
              </label>
            )}
            {renderInputField(section, key, value)}
            {(key === "LOG_LEVEL" ||
              key === "timezone" ||
              section === "api_keys") && (
              <a
                href={
                  key === "LOG_LEVEL"
                    ? "https://docs.python.org/3/library/logging.html#logging-levels"
                    : key === "timezone"
                    ? "https://en.wikipedia.org/wiki/List_of_tz_database_time_zones"
                    : section === "api_keys"
                    ? key === "alpha_vantage"
                      ? "https://www.alphavantage.co/support/#api-key"
                      : key === "open_weather_map"
                      ? "https://home.openweathermap.org/appid"
                      : key === "wolfram_alpha"
                      ? "https://products.wolframalpha.com/api/"
                      : "#"
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${linkColor} hover:underline flex items-center mt-1`}
              >
                {key === "LOG_LEVEL"
                  ? "View LOG_LEVEL documentation"
                  : key === "timezone"
                  ? "View list of valid timezones"
                  : section === "api_keys"
                  ? `Get ${snakeCaseToTitle(key)} API key`
                  : ""}{" "}
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            )}
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
              Last refreshed: {lastRefresh?.toLocaleString()}
            </span>
          )}
        </div>
        {renderConfigSection("logging", config.logging, "Logging Configuration")}
        {renderConfigSection("units", config.units, "Units of Measurement")}
        {renderConfigSection("location", config.location, "Location Settings")}
        {renderConfigSection("api_keys", config.api_keys, "External API Keys")}
        {renderConfigSection("hana", config.hana, "HANA Configuration")}
        {renderConfigSection("iris", config.iris, "IRIS Configuration")}
      </div>
    </div>
  );
};

export default HubManagementUI;