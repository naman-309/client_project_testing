import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "@/services/authService";

/**
 * authSlice.js
 *
 * Global auth state — read it anywhere via the selectors below.
 *
 * State:
 *   user         → logged in user object (name, email, role, avatar)
 *   accessToken  → JWT access token (memory only — never localStorage)
 *   isLoggedIn   → boolean
 *   isFirstLogin → sub-admin first login force change password
 *   loading      → an auth request is in flight
 *   error        → error message
 */

// ─────────────────────────────────────────────
// ASYNC THUNKS — API calls
// ─────────────────────────────────────────────

// POST /api/v1/auth/login
export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
    try {
        const { data } = await authService.login(credentials);
        return data.data; // { user, accessToken }
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
    }
});

// POST /api/v1/auth/logout
export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await authService.logout();
    } catch (err) {
        // Logout fail ho toh bhi state clear karo
        return rejectWithValue(err.response?.data?.message);
    }
});

// GET /api/v1/auth/me
// App start pe logged in user fetch karo
export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
    try {
        const { data } = await authService.me();
        return data.data; // { user }
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Session expired");
    }
});

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────
const initialState = {
    user: null,
    accessToken: null,
    isLoggedIn: false,
    isFirstLogin: false, // sub-admin must change password on first login
    loading: false,
    isInitializing: true, // boot-time session check (/auth/me) in progress
    error: null,
};

const setSession = (state, { user, accessToken, isFirstLogin }) => {
    state.user = user;
    if (accessToken) state.accessToken = accessToken;
    state.isLoggedIn = Boolean(user);
    state.isFirstLogin = Boolean(isFirstLogin ?? user?.is_first_login);
    state.loading = false;
    state.isInitializing = false;
    state.error = null;
};

const resetSession = (state) => ({ ...initialState, isInitializing: false, error: state.error });

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        setToken: (state, action) => {
            state.accessToken = action.payload;
        },
        setAuthFromOAuth: (state, action) => setSession(state, action.payload),
        clearError: (state) => {
            state.error = null;
        },
        clearAuth: () => ({ ...initialState, isInitializing: false }),
    },

    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => setSession(state, action.payload))
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isInitializing = false;
                state.error = action.payload;
            })

            // Logout — clear even if the API call fails
            .addCase(logoutUser.fulfilled, () => ({ ...initialState, isInitializing: false }))
            .addCase(logoutUser.rejected, () => ({ ...initialState, isInitializing: false }))

            // Session check — failure just means "guest", not an error
            .addCase(fetchMe.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchMe.fulfilled, (state, action) => setSession(state, action.payload))
            .addCase(fetchMe.rejected, (state) => resetSession({ ...state, error: null }));
    },
});

export const { setToken, setAuthFromOAuth, clearError, clearAuth } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────
export const selectUser = (state) => state.auth.user;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsFirstLogin = (state) => state.auth.isFirstLogin;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectIsInitializing = (state) => state.auth.isInitializing;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
