import React, { useState, useEffect } from "react";
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
  LOG_LEVEL:
    "The level of logging to be used by the backend. Supports Python logging levels.",
  system_unit:
    "The system of measurement to be used by the backend. Options: metric, imperial.",
  time_format:
    "The format for displaying time. Options: half (12-hour format), full (24-hour format).",
  lang:
    "The language/country code to be used by the backend. Must be a language code supported by the Python langcodes library.",
  default_lang: "The default language to be used by the IRIS web interface.",
  languages: "The languages supported by the IRIS web interface.",
  webui_chatbot_label: "The title in the IRIS web interface.",
  webui_mic_label:
    "The label for the microphone button in the IRIS web interface.",
  webui_input_placeholder:
    "The placeholder text for the chat input in the IRIS web interface.",
  webui_ws_url:
    "The WebSocket URL for the IRIS web interface, e.g. wss://<your-hub-ip>/ws. Must be wss for IRIS websat.",
  fastapi_title: "The title of the HANA instance.",
  fastapi_summary: "The summary text of the HANA instance.",
  enable_email: "Whether to enable email functionality in the backend.",
  node_username: "The username for connecting a Neon Node to your Neon Hub.",
  node_password: "The password for connecting a Neon Node to your Neon Hub.",
};

type ConfigSectionValue = string | number | string[] | boolean | object;

type ConfigSection = {
  [key: string]: ConfigSectionValue;
};

interface Config {
  lang?: string;
  secondary_langs?: string[];
  system_unit?: "metric" | "imperial";
  time_format?: "half" | "full";
  hana?: ConfigSection;
  MQ?: ConfigSection;
  iris?: ConfigSection;
  websocket?: ConfigSection;
  logging?: ConfigSection;
  skills?: {
    default_skills: string[];
    extra_dependencies: {
      [key: string]: string[];
    };
  };
  api_keys?: ConfigSection;
  [key: string]: unknown;
}

interface HubManagementUIProps {
  isDark: boolean;
}
const snakeCaseToTitle = (str: string) =>
  str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const HubManagementUI: React.FC<HubManagementUIProps> = ({ isDark }) => {
  const [config, setConfig] = useState<Config>({
    system_unit: "metric",
    time_format: "half",
    lang: 'en-us',
    logging: { LOG_LEVEL: "" },
    hana: {},
    iris: {},
    skills: { default_skills: [], extra_dependencies: {} },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [debouncedConfig, setDebouncedConfig] = useState(config);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedConfig(config);
    }, 1000);
    return () => clearTimeout(timer);
  }, [config]);
  useEffect(() => {
    if (!loading && lastRefresh) {
      saveConfig();
    }
  }, [debouncedConfig]);
  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Neon config with explicit JSON headers
      const neonResponse = await fetch('http://127.0.0.1:8000/v1/neon_config', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Check for JSON response
      const neonContentType = neonResponse.headers.get('content-type');
      if (!neonContentType?.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check the API endpoint.');
      }
      
      if (!neonResponse.ok) {
        throw new Error(`Failed to fetch Neon config: ${neonResponse.statusText}`);
      }
      
      const neonData = await neonResponse.json();
  
      // Fetch Diana config with explicit JSON headers
      const dianaResponse = await fetch('http://127.0.0.1:8000/v1/diana_config', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Check for JSON response
      const dianaContentType = dianaResponse.headers.get('content-type');
      if (!dianaContentType?.includes('application/json')) {
        throw new Error('Server returned non-JSON response. Please check the API endpoint.');
      }
      
      if (!dianaResponse.ok) {
        throw new Error(`Failed to fetch Diana config: ${dianaResponse.statusText}`);
      }
      
      const dianaData = await dianaResponse.json();
  
      setConfig(prev => ({
        ...prev,
        ...dianaData,
        ...neonData,
      }));
      
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch configuration');
      console.error('Config fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  const saveConfig = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const dianaConfig = { iris: config.iris };
      const { iris, ...neonConfig } = config;
      const dianaResponse = await fetch("http://127.0.0.1:8000/v1/diana_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dianaConfig),
      });
      if (!dianaResponse.ok) throw new Error("Failed to save Diana config");
      const neonResponse = await fetch("http://127.0.0.1:8000/v1/neon_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(neonConfig),
      });
      if (!neonResponse.ok) throw new Error("Failed to save Neon config");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save configuration"
      );
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    fetchConfig();
  }, []);
  const handleConfigChange = (
    section: keyof Config,
    key: string,
    value: ConfigSectionValue
  ) => {
    setConfig((prev) => {
      const currentSection = prev[section] as ConfigSection;
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [key]: value,
        },
      };
    });
  };
  const isSecret = (section: keyof Config, key: string): boolean => {
    return (
      key.includes("password") ||
      key.includes("secret") ||
      key.includes("api_key") ||
      section === "api_keys"
    );
  };

  const renderInputField = (section: keyof Config, key: string, value: unknown) => {
    const baseInputClass = `w-full p-2 rounded ${
      isDark ? "bg-gray-700" : "bg-white"
    } ${isDark ? "text-white" : "text-gray-900"} border ${
      isDark ? "border-orange-400" : "border-orange-600"
    }`;
  
    // Handle object values
    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return (
          <input
            type="text"
            value={value.join(', ')}
            onChange={(e) => handleConfigChange(section, key, e.target.value.split(',').map(item => item.trim()))}
            className={baseInputClass}
          />
        );
      }
      // For nested objects, display as JSON string
      return (
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              handleConfigChange(section, key, parsed);
            } catch (err) {
              console.error(err)
              // If invalid JSON, store as is
              handleConfigChange(section, key, e.target.value);
            }
          }}
          className={`${baseInputClass} font-mono text-sm`}
          rows={Object.keys(value).length + 1}
        />
      );
    }
  
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
  const bgColor = isDark ? "bg-gray-900" : "bg-white";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-orange-400" : "border-orange-600";
  const cardBgColor = isDark ? "bg-gray-800" : "bg-orange-100";
  const linkColor = isDark ? "text-orange-400" : "text-orange-600";
  const renderConfigSection = (
    section: keyof Config,
    data: ConfigSection | string | object,
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
              key === "lang" ||
              section === "api_keys") && (
              <a
                href={
                  key === "LOG_LEVEL"
                    ? "https://docs.python.org/3/library/logging.html#logging-levels"
                    : key === "lang"
                    ? "https://langcodes-hickford.readthedocs.io/en/sphinx/index.html#standards-implemented"
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
                  : key === "lang"
                  ? "View library documentation for language/country codes"
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
  if (loading && !lastRefresh) {
    return (
      <div
        className={`p-4 ${bgColor} ${textColor} min-h-screen flex items-center justify-center`}
      >
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className={`p-4 ${bgColor} ${textColor} min-h-screen`}>
      <div className="container mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <button
            onClick={fetchConfig}
            disabled={loading}
            className={`flex items-center p-2 rounded ${
              isDark
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-orange-500 hover:bg-orange-600"
            } text-white ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Configuration
          </button>
          {lastRefresh && (
            <span className="text-sm">
              Last refreshed:{lastRefresh.toLocaleString()}
            </span>
          )}
        </div>
        {error && (
          <div className={`mb-4 p-4 rounded-lg bg-red-500 text-white`}>
            {error}
          </div>
        )}
        {saveError && (
          <div className={`mb-4 p-4 rounded-lg bg-red-500 text-white`}>
            {saveError}
          </div>
        )}
        {saving && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            Saving changes...
          </div>
        )}
      {renderConfigSection("general", {...config.logging, "lang": config.lang}, "General Configuration")}
      {renderConfigSection("api_keys", config.api_keys || {}, "External API Keys")}
      {renderConfigSection("hana", config.hana || {}, "HANA Configuration")}
      {renderConfigSection("iris", config.iris || {}, "IRIS Configuration")}
      </div>
    </div>
  );
};
export default HubManagementUI;
