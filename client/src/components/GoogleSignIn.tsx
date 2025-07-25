import React from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';

interface GoogleSignInProps {
  className?: string;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ className = '' }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleRedirectLogin = () => {
    setIsLoading(true);
    window.location.href = import.meta.env.VITE_BASE_URL+'/login';
  };

  return (
    <div className={`w-full max-w-md ${className}`}>
      <button
        onClick={handleRedirectLogin}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          group relative w-full flex items-center justify-center gap-3 
          px-6 py-3.5 text-sm font-medium text-gray-700 
          bg-white border border-gray-300 rounded-lg
          transition-all duration-200 ease-in-out
          hover:bg-gray-50 hover:border-gray-400 hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`
          flex items-center justify-center w-5 h-5 
          transition-transform duration-200 ease-in-out
          ${isHovered && !isLoading ? 'scale-110' : 'scale-100'}
        `}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          ) : (
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
        </div>

        <span className="text-gray-700 font-medium">
          {isLoading ? 'Redirecting...' : 'Continue with Google'}
        </span>

        <ChevronRight
          className={`
            w-4 h-4 text-gray-400 transition-all duration-200 ease-in-out
            ${isHovered && !isLoading ? 'translate-x-1 text-gray-600' : ''}
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
        />

        <div className={`
          absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 
          opacity-0 transition-opacity duration-200 ease-in-out
          ${isHovered && !isLoading ? 'opacity-30' : ''}
        `} />
      </button>

      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Secure authentication powered by Google
          </span>
        </div>
      </div>
    </div>
  );
};
