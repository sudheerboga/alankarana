import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recent: [],
  status: 'idle',
  filters: {
    dateRange: 'month',
    type: 'all',
  },
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    setExpensesLoading(state) { state.status = 'loading'; },
    setRecentExpenses(state, action) {
      state.recent = action.payload;
      state.status = 'ready';
    },
    addExpense(state, action) { state.recent.unshift(action.payload); },
    setExpenseFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setExpensesLoading, setRecentExpenses, addExpense, setExpenseFilters } = expensesSlice.actions;
export const selectRecentExpenses = (s) => s.expenses.recent;
export const selectExpenseFilters = (s) => s.expenses.filters;
export default expensesSlice.reducer;
