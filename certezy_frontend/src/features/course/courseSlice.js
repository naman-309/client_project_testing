import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import courseService from "@/services/courseService";

/**
 * courseSlice.js
 *
 * Filters:
 *   category_id → number (backend expects category_id)
 *   level       → "beginner" | "intermediate" | "advanced"
 *   search      → string
 *   sort        → "newest" | "popular" | "price_low" | "price_high" | "rating"
 */

const SORT_MAP = {
    newest: { sortBy: "created_at", sortOrder: "DESC" },
    popular: { sortBy: "enrolled_count", sortOrder: "DESC" },
    price_low: { sortBy: "price", sortOrder: "ASC" },
    price_high: { sortBy: "price", sortOrder: "DESC" },
    rating: { sortBy: "rating_avg", sortOrder: "DESC" },
};

// ─────────────────────────────────────────────
// ASYNC THUNK
// ─────────────────────────────────────────────
export const fetchCourses = createAsyncThunk("course/fetchAll", async (params = {}, { rejectWithValue }) => {
    try {
        // Sort mapping — frontend value → backend params
        if (params.sort && SORT_MAP[params.sort]) {
            const { sortBy, sortOrder } = SORT_MAP[params.sort];
            params.sortBy = sortBy;
            params.sortOrder = sortOrder;
            delete params.sort;
        }

        const { data } = await courseService.getAll({
            status: "published",
            ...params,
        });
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to fetch courses");
    }
});
// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────
const courseSlice = createSlice({
    name: "course",

    initialState: {
        courses: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 12,
            totalPages: 0,
        },
        filters: {
            category_id: null, // number — backend expects category_id
            level: null, // "beginner" | "intermediate" | "advanced"
            search: null, // search query string
            sort: null, // sort option
        },
        loading: false,
        error: null,
    },

    reducers: {
        setFilter: (state, action) => {
            const { key, value } = action.payload;
            state.filters[key] = value;
            state.pagination.page = 1;
        },

        clearFilters: (state) => {
            state.filters = {
                category_id: null,
                level: null,
                search: null,
                sort: null,
            };
            state.pagination.page = 1;
        },

        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.courses = action.payload.data;
                state.pagination = action.payload.pagination;
                state.loading = false;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setFilter, clearFilters, setPage, clearError } = courseSlice.actions;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────
export const selectCourses = (state) => state.course.courses;
export const selectPagination = (state) => state.course.pagination;
export const selectFilters = (state) => state.course.filters;
export const selectCoursesLoading = (state) => state.course.loading;
export const selectCoursesError = (state) => state.course.error;

export default courseSlice.reducer;
