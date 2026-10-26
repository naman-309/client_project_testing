import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import courseReducer from "@/features/course/courseSlice";

/**
 * rootReducer.js
 *
 * Saare Redux slices yahan combine hote hain.
 * Naya slice banao → yahan add karo — bas.
 *
 * Current slices:
 *   auth → user, accessToken, isLoggedIn, isFirstLogin
 *
 * Aage add honge:
 *   category    → categories list (mega menu)
 *   course      → filters, search, current course
 *   cart        → checkout state
 *   notification → notifications, unreadCount
 */

const rootReducer = combineReducers({
    auth: authReducer,
    course: courseReducer,
});

export default rootReducer;
