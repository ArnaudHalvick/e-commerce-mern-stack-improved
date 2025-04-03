// Path: frontend/src/redux/slices/reviewsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { config } from "../../api";

// Async thunk for fetching initial page reviews (static, never change)
export const fetchPageReviews = createAsyncThunk(
  "reviews/fetchPageReviews",
  async (productId, { rejectWithValue }) => {
    try {
      // Create URL parameters for clean encoding
      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("limit", 5);
      params.append("sort", "date-desc");
      // No rating filter for page reviews

      // Construct the URL
      const url = `/api/reviews/products/${productId}?${params.toString()}`;

      // Use direct axios call to avoid caching issues
      const response = await axios.get(`${config.API_BASE_URL}${url}`, {
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

// Async thunk for fetching initial modal reviews (dynamic, changes with filters)
export const fetchModalReviews = createAsyncThunk(
  "reviews/fetchModalReviews",
  async (
    { productId, limit = 5, sort = "date-desc", ratingFilter = 0 },
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

      // Construct the URL
      const url = `/api/reviews/products/${productId}?${params.toString()}`;

      // Use direct axios call to avoid caching issues
      const response = await axios.get(`${config.API_BASE_URL}${url}`, {
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

// Async thunk for fetching more reviews (for infinite scrolling)
export const fetchMoreReviews = createAsyncThunk(
  "reviews/fetchMore",
  async (
    { productId, offset = 0, limit = 5, sort, ratingFilter },
    { rejectWithValue }
  ) => {
    try {
      // Create URL parameters object for clean encoding
      const params = new URLSearchParams();
      params.append("page", Math.floor(offset / limit) + 1); // Convert offset to page number
      params.append("limit", limit);
      params.append("sort", sort);

      // Apply rating filter if valid
      const parsedRating = parseInt(ratingFilter);
      if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
        params.append("rating", parsedRating);
      }

      // Construct the URL
      const url = `/api/reviews/products/${productId}?${params.toString()}`;

      // Use direct axios call to avoid any caching issues
      const response = await axios.get(`${config.API_BASE_URL}${url}`, {
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
      // Instead of making separate requests for each rating, just get all reviews data once
      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("limit", 1); // We only need the count data, not all reviews

      const url = `/api/reviews/products/${productId}?${params.toString()}`;

      // Use direct axios call to get the review data which includes distribution
      const response = await axios.get(`${config.API_BASE_URL}${url}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token"),
        },
      });

      // Extract the distribution from the response
      const distribution = response.data?.ratings?.distribution || {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      return distribution;
    } catch (error) {
      return rejectWithValue("Failed to fetch rating counts");
    }
  }
);

const initialState = {
  // Static reviews for product page - these should never change based on filters
  pageReviews: [],
  pageReviewsLoading: false,
  pageReviewsError: null,
  pageReviewsLoaded: false, // Flag to track if page reviews have been loaded

  // Modal reviews with infinite scroll - these can change based on filters
  modalReviews: [],

  // Current offset for infinite scroll (modal only)
  currentOffset: 0,

  // Total number of reviews
  totalReviews: 0,

  // Filter and sort state - these only affect modal reviews
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

  // UI state
  modalLoading: false,
  modalError: null,
  modalOpen: false,
  hasMore: true,

  // Current product ID
  currentProductId: null,
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    openReviewModal: (state) => {
      state.modalOpen = true;
      // Reset modal-specific state for fresh data
      state.modalReviews = [];
      state.currentOffset = 0;
      state.hasMore = true;
      state.modalError = null;
    },
    closeReviewModal: (state) => {
      state.modalOpen = false;
      // Reset rating filter to 0 when modal closes
      state.ratingFilter = 0;
    },
    setRatingFilter: (state, action) => {
      const oldFilter = state.ratingFilter;
      state.ratingFilter = action.payload;

      // Clear modal reviews when filter changes to prevent showing incorrect data
      // This should only affect the modal, not the static page reviews
      if (oldFilter !== action.payload) {
        state.modalReviews = [];
        state.currentOffset = 0;
        state.hasMore = true;
      }
    },
    setSortOption: (state, action) => {
      state.sortOption = action.payload;
      // Reset modal reviews for new sort
      // This should only affect the modal, not the static page reviews
      state.modalReviews = [];
      state.currentOffset = 0;
      state.hasMore = true;
    },
    resetReviewsState: (state) => {
      // Reset everything except pageReviews and related flags
      return {
        ...initialState,
        pageReviews: state.pageReviews,
        pageReviewsLoaded: state.pageReviewsLoaded,
        currentProductId: state.currentProductId,
      };
    },
    resetAllReviewsState: () => {
      // Complete reset to initial state
      return initialState;
    },
    incrementOffset: (state, action) => {
      state.currentOffset += action.payload || 5; // Default to incrementing by 5
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch page reviews (completely separate from modal reviews)
      .addCase(fetchPageReviews.pending, (state) => {
        state.pageReviewsLoading = true;
        state.pageReviewsError = null;
      })
      .addCase(fetchPageReviews.fulfilled, (state, action) => {
        state.pageReviewsLoading = false;
        state.pageReviews = action.payload.reviews || [];
        state.pageReviewsLoaded = true;
        state.totalReviews = action.payload.pagination?.totalReviews || 0;
        state.currentProductId = action.meta.arg;
      })
      .addCase(fetchPageReviews.rejected, (state, action) => {
        state.pageReviewsLoading = false;
        state.pageReviewsError = action.payload || "Failed to fetch reviews";
      })

      // Fetch modal reviews (completely separate from page reviews)
      .addCase(fetchModalReviews.pending, (state) => {
        state.modalLoading = true;
        state.modalError = null;
      })
      .addCase(fetchModalReviews.fulfilled, (state, action) => {
        state.modalLoading = false;
        state.modalReviews = action.payload.reviews || [];
        state.currentOffset = state.modalReviews.length;
        state.totalReviews = action.payload.pagination?.totalReviews || 0;
        state.currentProductId = action.meta.arg.productId;
        state.hasMore = state.modalReviews.length < state.totalReviews;
      })
      .addCase(fetchModalReviews.rejected, (state, action) => {
        state.modalLoading = false;
        state.modalError = action.payload || "Failed to fetch reviews";
      })

      // Fetch more reviews (for infinite scroll) - only affects modal
      .addCase(fetchMoreReviews.pending, (state) => {
        state.modalLoading = true;
        state.modalError = null;
      })
      .addCase(fetchMoreReviews.fulfilled, (state, action) => {
        state.modalLoading = false;

        // We directly get the data object from axios now
        const reviews = action.payload.reviews || [];
        const totalReviews = action.payload.pagination?.totalReviews || 0;

        // Avoid duplicates by checking _id
        const existingIds = new Set(state.modalReviews.map((r) => r._id));
        const newReviews = reviews.filter((r) => !existingIds.has(r._id));

        // Add new reviews to the existing ones
        state.modalReviews = [...state.modalReviews, ...newReviews];

        // Update offset and total
        state.currentOffset = state.modalReviews.length;
        state.totalReviews = totalReviews;

        // Determine if there are more reviews to load
        state.hasMore = state.modalReviews.length < totalReviews;
      })
      .addCase(fetchMoreReviews.rejected, (state, action) => {
        state.modalLoading = false;
        state.modalError = action.payload || "Failed to fetch more reviews";
        state.hasMore = false; // No more to fetch if there was an error
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
  resetAllReviewsState,
  incrementOffset,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;
