import React, { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const SmartFilterDropdown = ({
  label,
  value,
  options = [],
  onChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={`smart-dropdown ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className={`smart-dropdown-trigger ${isOpen ? "open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="smart-dropdown-label">{label}</span>
        <span className="smart-dropdown-value">{selectedOption?.label || "All"}</span>
        <FaChevronDown className={`smart-dropdown-caret ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen ? (
        <div className="smart-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`smart-dropdown-option ${value === option.value ? "active" : ""}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SmartFilterDropdown;
