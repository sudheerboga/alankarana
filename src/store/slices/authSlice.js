import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,       // { uid, email, phoneNumber, displayName, photoURL }
  role: null,       // 'admin' | 'staff' | 'accountant'
  status: 'idle',   // 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authLoading(state) {
      state.status = 'loading';
      state.error = null;
    },
    authSuccess(state, action) {
      state.user = action.payload.user;
      state.role = action.payload.role ?? 'admin';
      state.status = 'authenticated';
      state.error = null;
    },
    authLoggedOut(state) {
      state.user = null;
      state.role = null;
      state.status = 'unauthenticated';
      state.error = null;
    },
    authError(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const { authLoading, authSuccess, authLoggedOut, authError } = authSlice.actions;

export const selectUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectRole = (s) => s.auth.role;
export const selectIsAuthenticated = (s) => s.auth.status === 'authenticated';

export default authSlice.reducer;
