import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewsApi } from "../../services/api";

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
      const response = await reviewsApi.getProductReviews(
        productId,
        1,
        limit,
        sort,
        ratingFilter,
        bestRated
      );
      return response;
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
      const response = await reviewsApi.getProductReviews(
        productId,
        page,
        limit,
        sort,
        ratingFilter
      );
      return response;
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
      // Make API calls to get counts for each rating
      const promises = [1, 2, 3, 4, 5].map((rating) =>
        reviewsApi
          .getProductReviews(productId, 1, 1, "date-desc", rating)
          .then((data) => ({ rating, count: data.count }))
      );

      const results = await Promise.all(promises);

      // Convert results to an object
      const counts = results.reduce((acc, { rating, count }) => {
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
    },
    closeReviewModal: (state) => {
      state.modalOpen = false;
    },
    setRatingFilter: (state, action) => {
      // Toggle filter if same rating is selected
      state.ratingFilter =
        state.ratingFilter === action.payload ? 0 : action.payload;
      // Reset pagination for new filter
      state.currentPage = 1;
      state.modalReviews = [];
      state.hasMore = true;
    },
    setSortOption: (state, action) => {
      state.sortOption = action.payload;
      // Reset pagination for new sort
      state.currentPage = 1;
      state.modalReviews = [];
      state.hasMore = true;
    },
    resetReviewsState: (state) => {
      // Reset everything except currentProductId
      return {
        ...initialState,
        currentProductId: state.currentProductId,
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
        state.bestReviews = action.payload.reviews;
        state.totalReviews = action.payload.count;
        state.currentProductId = action.meta.arg.productId;
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

        // For first page, replace reviews; otherwise append
        if (state.currentPage === 1) {
          state.modalReviews = action.payload.reviews;
        } else {
          state.modalReviews = [
            ...state.modalReviews,
            ...action.payload.reviews,
          ];
        }

        state.totalReviews = action.payload.count;
        state.totalPages = action.payload.totalPages;
        state.hasMore = state.currentPage < action.payload.totalPages;
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
