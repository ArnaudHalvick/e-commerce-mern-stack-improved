// frontend/src/context/ErrorContext.jsx
// MIGRATION COMPLETE: This file now only exists for backwards compatibility
// All components have been migrated to use useErrorRedux directly

import useErrorRedux from "../hooks/useErrorRedux";

/**
 * @deprecated Use useErrorRedux from '../hooks/useErrorRedux' instead
 * This hook is maintained only for backwards compatibility.
 * @returns {Object} Error handler functions and state
 */
export const useError = () => {
  console.warn(
    "useError is deprecated and will be removed in a future version. Please use useErrorRedux from '../hooks/useErrorRedux' instead."
  );
  return useErrorRedux();
};

// No longer exporting ErrorProvider or context since all components have been migrated
export default {
  __NOTICE__: "This context is deprecated. Use useErrorRedux directly instead.",
};
