import { useState } from "react";

/**
 * Custom hook to manage tab navigation
 * @param {string} defaultTab - The default active tab
 * @returns {object} - The tab state and handlers
 */
const useTabs = (defaultTab = "description") => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleKeyDown = (e, tabName) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveTab(tabName);
    }
  };

  return {
    activeTab,
    handleTabChange,
    handleKeyDown,
  };
};

export default useTabs;
