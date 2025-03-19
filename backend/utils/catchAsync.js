/**
 * A utility function to wrap async Express route handlers to automatically catch errors
 * and pass them to the Express error handling middleware via next().
 *
 * This eliminates the need for try/catch blocks in each controller function.
 *
 * @param {Function} fn - The async function to wrap
 * @returns {Function} - An Express middleware function
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the passed function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
