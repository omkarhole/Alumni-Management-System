import React, { useEffect, useRef } from "react";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

const SmartSearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  buttonLabel = "Search",
  onSubmit,
  resultsCount,
  totalCount,
  entityLabel = "items",
  inputId,
  buttonId,
  className = "",
  children,
}) => {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onSubmit === "function") {
      onSubmit(value.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleShortcuts = (e) => {
      const target = e.target;
      const tag = target?.tagName?.toLowerCase() || "";
      const isEditable =
        tag === "input" || tag === "textarea" || target?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }

      if (!isEditable && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (e.key === "Escape" && document.activeElement === inputRef.current && value) {
        e.preventDefault();
        onChange("");
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [onChange, value]);

  const hasCounts =
    typeof resultsCount === "number" && typeof totalCount === "number";

  return (
    <form className={`smart-search ${className}`.trim()} onSubmit={handleSubmit}>
      <div className="smart-search-main">
        <div className="smart-search-input-wrap">
          <span className="smart-search-icon" aria-hidden="true">
            <FaSearch />
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            className="smart-search-input"
            placeholder={placeholder}
            aria-label={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
          />
          {value ? (
            <button
              type="button"
              className="smart-search-clear"
              aria-label="Clear search"
              onClick={handleClear}
            >
              <FaTimesCircle />
            </button>
          ) : null}
        </div>

        <button id={buttonId} className="btn btn-primary smart-search-btn" type="submit">
          {buttonLabel}
        </button>
      </div>

      <div className="smart-search-meta">
        <span>Press `/` or `Ctrl/Cmd + K` to focus</span>
        {hasCounts ? (
          <span>
            {resultsCount} of {totalCount} {entityLabel}
          </span>
        ) : null}
      </div>

      {children ? <div className="smart-search-controls">{children}</div> : null}
    </form>
  );
};

export default SmartSearchBar;
