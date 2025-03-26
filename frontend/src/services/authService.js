/**
 * Get authentication headers for API requests
 * @returns {Object} Headers object with auth token
 */
export const getAuthHeaders = async () => {
  const token = localStorage.getItem("auth-token");
  return {
    "Content-Type": "application/json",
    "auth-token": token,
  };
};
