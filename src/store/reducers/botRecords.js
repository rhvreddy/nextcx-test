import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import {REACT_APP_APP_BACK_END_BASE_URL} from '../../config';

export const fetchBotRecords = createAsyncThunk(
  'botRecords/fetch',
  async (searchQuery, thunkAPI) => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/get-all-bots-by-criteria`, {...searchQuery.payload}, {
        params: {
          searchTerm: searchQuery?.params?.searchTerm?.searchTerm || "",
          skip: searchQuery?.params?.skip || 0,
          limit: searchQuery?.params?.limit || 50
        },
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

export const validateBusinessUrl = createAsyncThunk("botRecords/validateUrl", async (payload, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/validate-url`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (err) {
    thunkAPI.rejectWithValue({message: err})
  }
})

export const validateProfileCreationForm = createAsyncThunk('botRecords/validateProfileCreationForm', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/create-user-and-assign-role`, data, {headers: {'Content-Type': 'application/json'}})
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})

export const validateSuperAdminCreation = createAsyncThunk('botRecords/validateSuperAdminCreation', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/create-superAdmin-and-assign-role`, data, {headers: {'Content-Type': 'application/json'}})
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})

export const validateUserPricingForm = createAsyncThunk('botRecords/validateUserPricingForm', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/pricing-form`, data, {headers: {'Content-Type': 'application/json'}})
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})

export const generateGoogleAuthURL = createAsyncThunk("botRecords/generateAuthURL", async function (data, thunkAPI) {
  try {
    let res = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/calendar/generate-google-oauth-url`);
    if (res?.data?.status?.toLowerCase() === "success") {
      return thunkAPI.fulfillWithValue({
        status: "success",
        message: "Successfully generated google Auth URL",
        URL: res?.data?.URL ? res?.data?.URL : ""
      })
    } else {
      return thunkAPI.rejectWithValue({
        status: "error",
        message: "Error occurred while generating Auth URL"
      })
    }
  } catch (err) {
    return thunkAPI.rejectWithValue({status: "error", message: "Error occurred while generating google Auth URl"})
  }
})

export const generateBusinessId = createAsyncThunk('botRecords/generateBusinessId', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/create-business-unit`, data, {headers: {'Content-Type': 'application/json'}})
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})

const botRecordSlice = createSlice({
  name: 'botRecords',
  initialState: {
    loading: false,
    records: [],
    totalNumberOfRecords: 0,
    status: 'idle',
    error: null
  },
  reducers: {
    resetBotRecords(state, action) {
      state.records = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBotRecords.pending, (state) => {
        state.loading = true
        state.status = 'loading';
      })
      .addCase(fetchBotRecords.fulfilled, (state, action) => {
        state.loading = false
        state.status = 'succeeded';
        let arr = []
        if (action?.payload?.data?.length > 0) {
          arr = action.payload.data.map(item => {
            if (item?.publishStatus === "Y") {
              item.status = "Published"
            }
            if (item?.botUseCase === "default" || item?.botUseCase === "basic") {
              item.botUseCase = "basic_gpt";
            }
            return item;
          })
        }
        if (action?.meta?.arg?.params?.skip === 0) {
          state.records = arr;
        } else {
          state.records = [...state?.records, ...arr];
        }
        state.totalNumberOfRecords = action?.payload?.totalNumberOfRecords
      })
      .addCase(fetchBotRecords.rejected, (state, action) => {
        state.loading = false
        state.status = 'failed';
        state.error = action?.payload?.message
      })
      .addCase(validateProfileCreationForm.fulfilled, (state, action) => {
        //handle success case
      })
      .addCase(validateProfileCreationForm.pending, (state, action) => {
        //handle pending case
      })
      .addCase(validateProfileCreationForm.rejected, (state, action) => {
        //handle rejecting case
      })
  },
});

export const fetchAllGuardRails = createAsyncThunk("botRecords/fetchAllGuardRails",async function(data, thunkAPI){
  try{
    let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/guard-rails/fetch-all-guard-rails`,data);
    if(res?.data?.status?.toLowerCase() === "success"){
      return thunkAPI.fulfillWithValue(res?.data)
    } else {
      return thunkAPI.rejectWithValue(res?.data)
    }
  } catch (err) {
    return thunkAPI.rejectWithValue({status: "error", message: "Error occurred while fetching all guard rails"})
  }
})

export const fetchBotGuardRails = createAsyncThunk("botRecords/fetchBotGuardRails", async function (data, thunkAPI) {
  try {
    let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/guard-rails/fetch-bot-guard-rails`, data);
    if (res?.data?.status?.toLowerCase() === "success") {
      return thunkAPI.fulfillWithValue(res?.data)
    } else {
      return thunkAPI.rejectWithValue(res?.data)
    }
  } catch (err) {
    return thunkAPI.rejectWithValue({
      status: "error",
      message: "Error occurred while fetching all guard rails for the given bot"
    })
  }
})

export const updateBotGuardRails = createAsyncThunk("botRecords/updateBotGuardRails", async function (data, thunkAPI) {
  try {
    let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/guard-rails/update-bot-guard-rails`, data);
    if (res?.data?.status?.toLowerCase() === "success") {
      return thunkAPI.fulfillWithValue(res?.data)
    } else {
      return thunkAPI.rejectWithValue({
        status: "error",
        message:  res?.data?.message || "Error occurred while applying changes related to guard rails for the given bot"
      })
    }
  } catch (err) {
    return thunkAPI.rejectWithValue({
      status: "error",
      message: "Error occurred while applying changes related to guard rails for the given bot"
    })
  }
})

export const addMultiAgentRequest = createAsyncThunk("botRecords/addMultiAgentRequest", async function (data, thunkAPI) {
  try {
    let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/app-gpt/insert/multi-agent`, data);
    if (res?.data?.status?.toLowerCase() === "success") {
      return thunkAPI.fulfillWithValue(res?.data)
    } else {
      return thunkAPI.rejectWithValue({
        status: "error",
        message: res?.data?.message || "Error occurred while defining workflow for the give bot.Please try again"
      })
    }
  } catch (err) {
    return thunkAPI.rejectWithValue({
      status: "error",
      message: "Error occurred while defining workflow for the give bot.Please try again"
    })
  }
})

export const fetchAIAppsDocument = createAsyncThunk("botRecords/fetchDocument",async (data, thunkApi)=>{
  try {
    let res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-apps/v0/fetch-document`, data)
    if (res?.data?.status?.toLowerCase() === "success") {
      return thunkApi.fulfillWithValue(res?.data)
    } else {
      return thunkApi.rejectWithValue(res?.data)
    }
  }
  catch(err){
    return thunkApi.rejectWithValue({
      status:"error",
      message:"Error occurred while fetching requested document",
      error:err?.message
    })
  }
})

export const modelComparison = createAsyncThunk(
  'botRecords/modelComparison',
  async (data, thunkAPI) => {
    try {

      const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/metrics/model-comparison/models/${data}`, );

      return thunkAPI.fulfillWithValue(response?.data);

    } catch (e) {
      return thunkAPI.rejectWithValue({message: e.message});
    }

  }
);

export const getAllModels = createAsyncThunk('botRecords/getAllModels', async function (data, thunkAPI) {
    try {
      const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/metrics/get-all-models`)

      return thunkAPI.fulfillWithValue(response?.data);
    } catch(e) {
      return thunkAPI.rejectWithValue({message: e.message});
    }
})

export const startModelUpgrade = createAsyncThunk('botRecords/startModelUpgrade', async function (formData, thunkAPI) {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/app-gpt/insert/ai-model-upgrade`, formData);

    return thunkAPI.fulfillWithValue(response?.data);
  } catch(e) {
    thunkAPI.rejectWithValue({message: e.message});
  }
})

export const addCustomGuardRail = createAsyncThunk('botRecords/addCustomGuardRail', async function (data, thunkAPI) {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-business-units/v0/add-custom-guard-rail`, data);

    return thunkAPI.fulfillWithValue(response?.data);
  } catch(e) {
    thunkAPI.rejectWithValue({message: e.message});
  }
})

export const {resetBotRecords} = botRecordSlice.actions;

export default botRecordSlice.reducer;
