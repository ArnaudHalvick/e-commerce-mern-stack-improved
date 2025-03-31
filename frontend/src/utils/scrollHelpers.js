/**
 * Utility functions for scrolling elements into view
 */

/**
 * Scrolls the product display element into view
 * @param {Object} options - Scrolling options
 * @param {string} options.behavior - Scrolling behavior ('auto' or 'smooth')
 * @param {string} options.block - Vertical alignment ('start', 'center', 'end', or 'nearest')
 * @param {number} options.delay - Delay in milliseconds before scrolling
 * @returns {Promise} - Promise that resolves after scrolling
 */
export const scrollToProductDisplay = (options = {}) => {
  const { behavior = "smooth", block = "start", delay = 100 } = options;

  return new Promise((resolve) => {
    setTimeout(() => {
      const productDisplayElement = document.querySelector(".product-display");
      if (productDisplayElement) {
        productDisplayElement.scrollIntoView({ behavior, block });
      }
      resolve();
    }, delay);
  });
};

/**
 * Scrolls an element with the specified selector into view
 * @param {string} selector - CSS selector for the element to scroll to
 * @param {Object} options - Scrolling options
 * @param {string} options.behavior - Scrolling behavior ('auto' or 'smooth')
 * @param {string} options.block - Vertical alignment ('start', 'center', 'end', or 'nearest')
 * @param {number} options.delay - Delay in milliseconds before scrolling
 * @returns {Promise} - Promise that resolves after scrolling
 */
export const scrollToElement = (selector, options = {}) => {
  const { behavior = "smooth", block = "start", delay = 100 } = options;

  return new Promise((resolve) => {
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior, block });
      }
      resolve();
    }, delay);
  });
};

/**
 * Scrolls to the top of the page
 * @param {Object} options - Scrolling options
 * @param {string} options.behavior - Scrolling behavior ('auto' or 'smooth')
 * @param {number} options.delay - Delay in milliseconds before scrolling
 * @returns {Promise} - Promise that resolves after scrolling
 */
export const scrollToTop = (options = {}) => {
  const { behavior = "smooth", delay = 0 } = options;

  return new Promise((resolve) => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior,
      });
      resolve();
    }, delay);
  });
};
