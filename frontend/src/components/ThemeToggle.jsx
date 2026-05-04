import React from 'react';
import { useTheme } from '../ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-sm btn-light d-flex align-items-center gap-2 py-2 px-3"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        border: 'none',
        background: theme === 'light' ? '#f8f9fa' : '#343a40',
        color: theme === 'light' ? '#000000' : '#ffffff',
        borderRadius: '20px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
      }}
    >
      {theme === 'light' ? (
        <>
          <FaMoon size={16} />
          <span>Dark</span>
        </>
      ) : (
        <>
          <FaSun size={16} />
          <span>Light</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
