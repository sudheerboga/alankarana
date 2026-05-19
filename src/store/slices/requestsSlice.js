import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  status: 'idle',
  filter: 'all', // 'all' | 'pending' | 'completed'
};

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setRequestsLoading(state) { state.status = 'loading'; },
    setRequests(state, action) {
      state.list = action.payload;
      state.status = 'ready';
    },
    upsertRequest(state, action) {
      const idx = state.list.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
      else state.list.unshift(action.payload);
    },
    removeRequest(state, action) {
      state.list = state.list.filter((r) => r.id !== action.payload);
    },
    setRequestFilter(state, action) { state.filter = action.payload; },
  },
});

export const { setRequestsLoading, setRequests, upsertRequest, removeRequest, setRequestFilter } = requestsSlice.actions;
export const selectRequests = (s) => s.requests.list;
export const selectRequestFilter = (s) => s.requests.filter;
export default requestsSlice.reducer;
