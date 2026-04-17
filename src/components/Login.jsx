import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/farm-logo.png';

export default function Login({ onLogin }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onLogin({ email: data.email, token: data.token });
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError("Server error. Backend is not running.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center items-center p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-green-600">
        <div className="flex flex-col items-center mb-2 sm:mb-4 -mt-4 sm:-mt-6 md:-mt-10 lg:-mt-12">
          <img src={logo} alt="Farm Logo" className="w-40 sm:w-64 md:w-80 lg:w-96 h-auto object-contain drop-shadow-md relative z-10 " />
          <p className="-mt-6 sm:-mt-10 md:-mt-14 lg:-mt-16 text-green-800 dark:text-green-300 font-serif italic text-[11px] sm:text-sm md:text-base lg:text-lg font-bold text-center tracking-widest z-20 relative">{t('common.tagline', 'हर किसान का डिजिटल साथी')}</p>
        </div>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.email', 'Email / Username')}</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="e.g., john@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('common.password', 'Password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 shadow-md transition"
          >
            {isRegister ? t('common.register', 'Register') : t('common.login', 'Login')}
          </button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            {isRegister ? t('common.switchToLogin', 'Already have an account? Login') : t('common.switchToRegister', "Don't have an account? Register")}
            <button 
              type="button" 
              onClick={() => setIsRegister(!isRegister)} 
              className="ml-1 text-green-600 font-bold hover:underline"
            >
              {isRegister ? t('common.login', 'Login here') : t('common.register', 'Register here')}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}