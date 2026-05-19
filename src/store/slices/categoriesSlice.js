import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_CATEGORIES } from '../../constants';

const initialState = {
  list: DEFAULT_CATEGORIES, // Start with defaults; merge with Firestore on sync
  status: 'idle',
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategoriesLoading(state) {
      state.status = 'loading';
    },
    setCategories(state, action) {
      // Merge defaults with custom — dedupe by id
      const map = new Map();
      [...DEFAULT_CATEGORIES, ...action.payload].forEach((c) => map.set(c.id, c));
      state.list = Array.from(map.values());
      state.status = 'ready';
    },
    addCategory(state, action) {
      if (!state.list.some((c) => c.id === action.payload.id)) {
        state.list.push(action.payload);
      }
    },
    setCategoriesError(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const { setCategoriesLoading, setCategories, addCategory, setCategoriesError } = categoriesSlice.actions;

export const selectCategories = (s) => s.categories.list;
export const selectCategoryById = (id) => (s) => s.categories.list.find((c) => c.id === id);

export default categoriesSlice.reducer;
