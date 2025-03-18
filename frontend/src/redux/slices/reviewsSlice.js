// Path: frontend/src/redux/slices/reviewsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for fetching initial reviews
export const fetchInitialReviews = createAsyncThunk(
  "reviews/fetchInitial",
  async (
    {
      productId,
      limit = 5,
      sort = "rating-desc",
      ratingFilter = 0,
      bestRated = true,
    },
    { rejectWithValue }
  ) => {
    try {
      // Create URL parameters for clean encoding
      const params = new URLSearchParams();
      params.append("page", 1); // Initial reviews always start at page 1
      params.append("limit", limit);
      params.append("sort", sort);

      // Apply valid rating filters
      const parsedRating = parseInt(ratingFilter);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        params.append("rating", parsedRating);
      }

      // Add bestRated parameter if true
      if (bestRated) {
        params.append("bestRated", "true");
      }

      // Construct the URL
      const url = `/api/reviews/product/${productId}?${params.toString()}`;

      // Use direct axios call to avoid caching issues
      const response = await axios.get(`http://localhost:4000${url}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : "An error occurred while fetching reviews"
      );
    }
  }
);

// Async thunk for fetching more reviews (pagination)
export const fetchMoreReviews = createAsyncThunk(
  "reviews/fetchMore",
  async (
    { productId, page, limit = 5, sort, ratingFilter },
    { rejectWithValue }
  ) => {
    try {
      // Create URL parameters object for clean encoding
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      params.append("sort", sort);

      // Apply rating filter if valid
      const parsedRating = parseInt(ratingFilter);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        params.append("rating", parsedRating);
      }

      // Construct the URL
      const url = `/api/reviews/product/${productId}?${params.toString()}`;

      // Use direct axios call to avoid any caching issues
      const response = await axios.get(`http://localhost:4000${url}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        typeof error === "string"
          ? error
          : "An error occurred while fetching more reviews"
      );
    }
  }
);

// Async thunk for fetching review counts by rating
export const fetchReviewCounts = createAsyncThunk(
  "reviews/fetchCounts",
  async (productId, { rejectWithValue }) => {
    try {
      // Create separate API requests for each rating
      const countRequests = [1, 2, 3, 4, 5].map(async (rating) => {
        // For each rating (1-5), make a specific API call using URLSearchParams for clean encoding
        const params = new URLSearchParams();
        params.append("page", 1);
        params.append("limit", 1); // We only need the count, not the actual reviews
        params.append("rating", rating);

        const url = `/api/reviews/product/${productId}?${params.toString()}`;

        try {
          // Use direct axios call to avoid any local caching
          const response = await axios.get(`http://localhost:4000${url}`, {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "auth-token": localStorage.getItem("auth-token"),
            },
          });

          // Extract the count from the response
          const count = response.data?.count || 0;

          return { rating, count };
        } catch (err) {
          return { rating, count: 0 };
        }
      });

      // Wait for all counts to be fetched
      const countResults = await Promise.all(countRequests);

      // Convert the results to an object
      const counts = countResults.reduce((acc, { rating, count }) => {
        acc[rating] = count;
        return acc;
      }, {});

      return counts;
    } catch (error) {
      return rejectWithValue("Failed to fetch rating counts");
    }
  }
);

const initialState = {
  // Best reviews for product page
  bestReviews: [],
  // Initial best reviews that never change
  initialBestReviews: [],
  // Modal reviews with infinite scroll
  modalReviews: [],

  // Pagination state
  currentPage: 1,
  totalPages: 0,
  hasMore: true,

  // Filter and sort state
  sortOption: "date-desc",
  ratingFilter: 0,

  // Counts for each rating (1-5 stars)
  ratingCounts: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },

  // Total number of reviews
  totalReviews: 0,

  // UI state
  loading: false,
  error: null,
  modalOpen: false,

  // Current product ID
  currentProductId: null,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    openReviewModal: (state) => {
      state.modalOpen = true;
      // Reset state for fresh data
      state.modalReviews = [];
      state.currentPage = 1;
      state.hasMore = true;
      state.error = null;
    },
    closeReviewModal: (state) => {
      state.modalOpen = false;
      // Reset rating filter to 0 when modal closes
      state.ratingFilter = 0;
      // Restore best reviews to initial values
      if (state.initialBestReviews.length > 0) {
        state.bestReviews = [...state.initialBestReviews];
      }
    },
    setRatingFilter: (state, action) => {
      const oldFilter = state.ratingFilter;
      state.ratingFilter = action.payload;
      state.currentPage = 1; // Reset to first page when filter changes

      // Clear reviews when filter changes to prevent showing incorrect data
      if (oldFilter !== action.payload) {
        state.modalReviews = [];
        state.hasMore = true;
      }
    },
    setSortOption: (state, action) => {
      state.sortOption = action.payload;
      // Reset pagination for new sort
      state.currentPage = 1;
      state.modalReviews = [];
      state.hasMore = true;
    },
    resetReviewsState: (state) => {
      // Reset everything except currentProductId and initialBestReviews
      return {
        ...initialState,
        currentProductId: state.currentProductId,
        ratingFilter: 0, // Explicitly reset to ensure initial reviews are unfiltered
        initialBestReviews: state.initialBestReviews,
        bestReviews:
          state.initialBestReviews.length > 0
            ? [...state.initialBestReviews]
            : [],
      };
    },
    incrementPage: (state) => {
      state.currentPage += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch initial reviews (best reviews)
      .addCase(fetchInitialReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInitialReviews.fulfilled, (state, action) => {
        state.loading = false;
        // We directly get the data object from axios now
        const reviews = action.payload.reviews || [];

        // If bestRated is true, this is for the initial best reviews that should never change
        if (action.meta.arg.bestRated) {
          state.bestReviews = reviews;
          state.initialBestReviews = reviews;
        } else if (state.modalOpen) {
          // If modal is open, this is for the modal only
          state.modalReviews = reviews;
        } else {
          // For other cases, just update bestReviews
          state.bestReviews = reviews;
        }

        state.totalReviews = action.payload.count || 0;
        state.currentProductId = action.meta.arg.productId;
        // Reset current page to 1 when initial reviews are loaded
        state.currentPage = 1;
        // Set total pages and hasMore
        state.totalPages = action.payload.totalPages || 0;
        state.hasMore = state.currentPage < (action.payload.totalPages || 0);
      })
      .addCase(fetchInitialReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reviews";
      })

      // Fetch more reviews (pagination for modal)
      .addCase(fetchMoreReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMoreReviews.fulfilled, (state, action) => {
        state.loading = false;

        // We directly get the data object from axios now
        const reviews = action.payload.reviews || [];
        const totalReviews = action.payload.count || 0;
        const totalPages = action.payload.totalPages || 0;

        // For first page, replace reviews; otherwise append
        if (state.currentPage === 1) {
          state.modalReviews = reviews;
        } else {
          // Avoid duplicates by checking _id
          const existingIds = new Set(state.modalReviews.map((r) => r._id));
          const newReviews = reviews.filter((r) => !existingIds.has(r._id));
          state.modalReviews = [...state.modalReviews, ...newReviews];
        }

        state.totalReviews = totalReviews;
        state.totalPages = totalPages;
        state.hasMore = state.currentPage < totalPages;
      })
      .addCase(fetchMoreReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch more reviews";
        state.hasMore = false;
      })

      // Fetch rating counts
      .addCase(fetchReviewCounts.fulfilled, (state, action) => {
        state.ratingCounts = action.payload;
      });
  },
});

export const {
  openReviewModal,
  closeReviewModal,
  setRatingFilter,
  setSortOption,
  resetReviewsState,
  incrementPage,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
