import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {REACT_APP_APP_BACK_END_BASE_URL} from '../../config';

export const fetchUserRecords = createAsyncThunk(
  'userRecords/fetch',
  async (data, thunkAPI) => {
    try {
      const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/app-gpt/fetch/users?userId=${data.payload.userId}&businessId=${data.payload.businessId}&searchTerm=${data.payload.searchTerm?.searchTerm}&skip=${data.payload.skip}&limit=${data.payload.limit}`, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      return response.data;

    } catch (e) {
      return thunkAPI.rejectWithValue({message: e.message});
    }

  }
);

export const fetchAllBusinessIds = createAsyncThunk(
  'userRecords/fetchAllBusinessIds',
  async (data,thunkAPI) => {
    try{
      const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/get-all-businessIds/${data}`,{
        headers:{
          'Content-Type': 'application/json'
        }
      });
      return response.data
    }catch(error){
      return thunkAPI.rejectWithValue({message: e.message});
    }
  }
)

export const fetchAllAdminsInBusiness = createAsyncThunk(
  'userRecords/fetchAllAdminsInBusiness',
  async (data,thunkAPI) => {
    try{
      const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/user/get-all-admins-in-business/${data}`,{
        headers:{
          'Content-Type': 'application/json'
        }
      });
      return response.data
    }catch(error){
      return thunkAPI.rejectWithValue({message: e.message});
    }
  }
)

const userRecordsSlice = createSlice({
  name: 'userRecords',
  initialState: {
    loading: false,
    records: [],
    totalNumberOfRecords: 0,
    status: 'idle',
    error: null
  },
  reducers: {
    resetUserRecords(state, action) {
      state.records = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRecords.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(fetchUserRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        if (action?.meta?.arg?.payload?.skip === 0) {
          state.records = action?.payload?.users;
        } else {
          state.records = [...state?.records, ...action?.payload?.users];
        }
        state.totalNumberOfRecords = action?.payload?.totalCount;
      })
      .addCase(fetchUserRecords.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action?.payload?.message;
      })
  },
});

export const {resetUserRecords} = userRecordsSlice.actions;

export default userRecordsSlice.reducer;
