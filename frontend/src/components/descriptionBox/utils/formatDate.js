/**
 * Format a date string to a localized format
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default formatDate;
