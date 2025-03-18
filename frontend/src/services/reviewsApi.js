import apiClient from "./apiClient";

/**
 * Reviews API service for handling product reviews
 */
const reviewsApi = {
  /**
   * Get reviews for a product with pagination and sorting
   * @param {string} productId - ID of the product to get reviews for
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of reviews per page
   * @param {string} sort - Sort option (date-desc, date-asc, rating-desc, rating-asc)
   * @param {number} ratingFilter - Optional filter for ratings (1-5, 0 for all)
   * @param {boolean} bestRated - If true, returns the best rated reviews first
   * @returns {Promise} - Promise that resolves to reviews data
   */
  getProductReviews: async (
    productId,
    page = 1,
    limit = 5,
    sort = "date-desc",
    ratingFilter = 0,
    bestRated = false
  ) => {
    try {
      // Create a clean params object to ensure proper URL encoding
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      params.append("sort", sort);

      // Only add rating if it's valid (1-5)
      const parsedRating = parseInt(ratingFilter);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        params.append("rating", parsedRating);
        console.log(`Adding rating filter: ${parsedRating}`);
      }

      // Add bestRated if true
      if (bestRated) {
        params.append("bestRated", "true");
      }

      // Construct the URL - using URLSearchParams ensures proper encoding
      const url = `/api/reviews/product/${productId}?${params.toString()}`;
      console.log(`Making API request to: ${url}`);

      // Make the API call with axios
      const response = await apiClient.get(url);

      // Log the response summary
      console.log(
        `API Response: ${response.data.reviews?.length || 0}/${
          response.data.count
        } reviews` +
          (parsedRating >= 1 && parsedRating <= 5
            ? ` for rating ${parsedRating}`
            : "")
      );

      // Debug: Log the first review's rating to verify filtering
      if (response.data.reviews && response.data.reviews.length > 0) {
        console.log(`First review rating: ${response.data.reviews[0].rating}`);
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw error.message;
      } else {
        throw new Error("Failed to fetch reviews");
      }
    }
  },

  /**
   * Add a new review for a product
   * @param {object} reviewData - Review data to submit
   * @returns {Promise} - Promise that resolves to the created review
   */
  addReview: async (reviewData) => {
    try {
      const response = await apiClient.post("/api/reviews", reviewData);
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      if (error.response?.data) {
        throw error.response.data;
      } else if (error.message) {
        throw error.message;
      } else {
        throw new Error("Failed to add review");
      }
    }
  },
};

export default reviewsApi;
