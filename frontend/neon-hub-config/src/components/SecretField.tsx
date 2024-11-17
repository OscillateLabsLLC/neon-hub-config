import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const SecretField: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  isDark: boolean;
}> = ({ value, onChange, className = '', isDark }) => {
  const [showSecret, setShowSecret] = useState(false);
  
  const toggleVisibility = () => setShowSecret(!showSecret);
  
  const buttonClass = `absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md 
    ${isDark 
      ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
      : 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
    } 
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500`;

  return (
    <div className="relative">
      <input
        type={showSecret ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={`pr-10 ${className}`}
      />
      <button 
        type="button"
        onClick={toggleVisibility}
        className={buttonClass}
        aria-label={showSecret ? 'Hide value' : 'Show value'}
      >
        {showSecret ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default SecretField;