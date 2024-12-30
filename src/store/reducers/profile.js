// third-party
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// project imports
import axios from 'axios';
import {CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL} from '../../config';
import jwt from 'jsonwebtoken';

const JWT_SECRET_KEY = 'LMS SECRET';

// ----------------------------------------------------------------------

const initialState = {
  error: null,
  loading: false,
  user: null,
  isLoggedIn: false,
  updatedProfile: false,
  userAvatar: null,
  editProfile: false,
  showEditButton: true,
  imageUpload: false,
  forgotPasswordApiResponse: null,
  resetPasswordApiResponse: null
};
function getUserData() {
  const data = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    screenHeight: window.screen.height,
    screenWidth: window.screen.width,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth,
    colorDepth: window.screen.colorDepth,
    pixelDepth: window.screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio,
    timezoneOffset: new Date().getTimezoneOffset(),
    cookieEnabled: navigator.cookieEnabled,
    online: navigator.onLine
  }

  return data;
}

const profile = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('appRoles');
      localStorage.removeItem('businessId');
      localStorage.removeItem('organizationId');
      localStorage.removeItem("conversationId")
      localStorage.removeItem("activeNavItem")
      localStorage.removeItem("botId")
      localStorage.removeItem('versionNumber')
      localStorage.removeItem("current_bot_user_id")
      localStorage.removeItem("current_convId")
    },
    setLoginState(state, action) {
      if(state.user?.appRoles?.length > 0) {
        state.isLoggedIn = true
      }
      state.user = action.payload.userInfo
    },
    setForgotPasswordApiState(state,action){
      state.forgotPasswordApiResponse = null
    },
    setResetPasswordApiState(state,action) {
      state.resetPasswordApiResponse = null
    },
    setUserAvatar(state, action) {
      state.userAvatar = action.payload
    },
    setEditProfile(state,action){
      state.editProfile = action.payload
    },
    setEditButton(state,action){
      state.showEditButton = action.payload
    },
    setImageUpload(state, action) {
      state.imageUpload = action.payload
    },
    initializeAutoLogin(state, action){
      state.loading = false;
      state.user = action.payload.user;
      state.user.name = `${action.payload.user.firstName} ${action.payload.user.lastName}`;
      localStorage.setItem('userId', action.payload.user.userId);
      localStorage.setItem('appRoles', JSON.stringify(action.payload?.user?.appRoles));
      localStorage.setItem('businessId', action.payload?.user?.businessId ? action.payload?.user?.businessId : "");
      localStorage.setItem('organizationId', action.payload?.user?.organizationId ? action.payload?.user?.organizationId : "");
      localStorage.setItem('isAuthenticated', "Y");
      state.isLoggedIn = true;
      state.error = null
    },
    restrictPath(state, action) {
      state.isAdminPathRestricted = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.user.name = `${action.payload.user.firstName} ${action.payload.user.lastName}`;
        localStorage.setItem('userId', action.payload.user.userId);
        localStorage.setItem('appRoles', JSON.stringify(action.payload?.user?.appRoles));
        localStorage.setItem('businessId', action.payload?.user?.businessId ? action.payload?.user?.businessId : "");
        localStorage.setItem('organizationId', action.payload?.user?.organizationId ? action.payload?.user?.organizationId : "");
        state.isLoggedIn = true;
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload.error;
      })
      .addCase(loginUsingOtp.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(loginUsingOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.user.name = `${action.payload.user.firstName} ${action.payload.user.lastName}`;
        localStorage.setItem('userId', action.payload.user.userId);
        localStorage.setItem('appRoles', JSON.stringify(action.payload?.user?.appRoles) );
        localStorage.setItem('businessId', action.payload?.user?.businessId ? action.payload?.user?.businessId : "");
        localStorage.setItem('organizationId', action.payload?.user?.organizationId ? action.payload?.user?.organizationId : "");
        localStorage.setItem('isAuthenticated', "Y");
        state.isLoggedIn = true;
        state.error = null
      })
      .addCase(loginUsingOtp.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isLoggedIn = false;
        state.error = action.payload.error;
      })
      .addCase(getUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null
      })
      .addCase(getUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.userInfo;
        state.user.name = (action.payload?.userInfo?.firstName && action.payload?.userInfo?.lastName) ? `${action.payload.userInfo.firstName} ${action.payload.userInfo.lastName}` : action.payload.userInfo?.name;
        state.isLoggedIn = true;
        state.error = null
      })
      .addCase(getUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
      .addCase(updateProfileInfo.pending, (state) => {
        state.updatedProfile = false;
        state.loading = true;
        state.error = null
        state.userAvatar = null
      })
      .addCase(updateProfileInfo.fulfilled, (state, action) => {
        if (action.payload.status.toLowerCase() === 'success' && action.payload?.userId === localStorage.getItem("userId")) {
          state.loading = false;
          state.updatedProfile = true;
          state.user = { ...state.user, ...action.payload.userInfo };
          state.user.name = `${action.payload.userInfo.firstName} ${action.payload.userInfo.lastName}`;
          state.error = null;
          state.userAvatar = null;
        } else {
          state.loading = false;
          state.error = action.payload.error;
        }
      })
      .addCase(updateProfileInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
      })
      .addCase(register.pending, (state, action) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
      })
      .addCase(register.rejected,(state, action) => {
        state.loading = false
        state.error = action.payload.error
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.forgotPasswordApiResponse = {response:action.payload, loading:false}
      })
      .addCase(forgotPassword.pending, (state, action) => {
        state.forgotPasswordApiResponse = {response:null,loading:true}
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordApiResponse = {response:action.payload, loading:false}
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetPasswordApiResponse = {response:action.payload, loading:false}
      })
      .addCase(resetPassword.pending, (state, action) => {
        state.resetPasswordApiResponse = {response:null,loading:true}
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordApiResponse = {response:action.payload, loading:false}
      })
    }
  });
// Reducer

export const { logout, setLoginState, setUserAvatar, setForgotPasswordApiState , setResetPasswordApiState, setEditProfile, setEditButton, setImageUpload,initializeAutoLogin, restrictPath } = profile.actions;
export default profile.reducer;


export const login = createAsyncThunk('profile/login', async (loginInfo, thunkAPI) => {
  try {
    const signedToken = jwt.sign(loginInfo, JWT_SECRET_KEY);
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/signin-v2`, { tokenInfo: signedToken });
    if (!response.data.user) {
      let loginResponse = {error: response?.data.message};
      if(response?.data?.userNotFound){
        loginResponse["userNotFound"] = response?.data?.userNotFound;
      }
      return thunkAPI.rejectWithValue(loginResponse);
    }
    return response.data;
  } catch (e) {
    return thunkAPI.rejectWithValue({ error: e.message });
  }
});

export const loginUsingOtp = createAsyncThunk('profile/loginUsingOtp', async (loginInfo, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/user/verifyOtp`, loginInfo);
    if (!response.data.user) {
      return thunkAPI.rejectWithValue({ error: response.data.message });
    }
    return response.data;
  } catch (e) {
    return thunkAPI.rejectWithValue({ error: e.message });
  }
});

export const getUserInfo = createAsyncThunk('profile/get', async (userId, thunkAPI) => {
  try {
    const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/get-user-info/${userId}`);
    if (!response.data.userInfo) {
      return thunkAPI.rejectWithValue({ error: response.data.message });
    }
    return response.data;

  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const updateProfileInfo = createAsyncThunk('profile/update', async (formData, thunkAPI) => {
  try {
    const updateInfo = JSON.parse(formData.get("updateInfo"))
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/update-user-profile/${updateInfo.userId}`,
      formData);
    delete updateInfo.info.userAvatar
    return { ...response.data, userInfo: updateInfo.info };
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const changePassword = createAsyncThunk('profile/changePassword',async(data,thunkAPI)=>{
  try{
    const res = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/change-password`,
      data
    );
    if (res && res.data) {
      let response = res.data;
      if (response?.status?.toLowerCase() === 'success') {
        return thunkAPI.fulfillWithValue(response);
      } else {
        return thunkAPI.rejectWithValue(response);
      }
    } else {
      return thunkAPI.rejectWithValue({ status: 'error', message: 'empty response' });
    }
  }
  catch(err){
    thunkAPI.rejectWithValue({
      status:"error",
      message:"run time error occurred"
    })
  }
})

export const register = createAsyncThunk('profile/signup', async (registerInfo, thunkAPI) => {
  try {
    const signedToken = jwt.sign(registerInfo, JWT_SECRET_KEY);
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/signup-v2`, { tokenInfo: signedToken });
    if(response.data.status.toLowerCase() === 'error') {
      return thunkAPI.rejectWithValue({ error: response.data.message });
    }
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const autoBotCreation = createAsyncThunk('user/autoBotCreate', async (payload,thunkAPI) => {
  try {
    let formData = new FormData();
    let metadataObj = getUserData();
    let platform = metadataObj.platform;
    metadataObj.platformName = platform.name;
    metadataObj.platformVersion = platform.version;
    metadataObj.platformLayout = platform.layout;
    metadataObj.platformOs = platform.os ? (platform.os.architecture + " -bit," + platform.os.family + "," + platform.os.version) : "";
    metadataObj.platformDescription = platform.description;
    metadataObj.platformProduct = platform.product;
    metadataObj.platformManufacturer = platform.manufacturer;
    let botObject = {botName:payload.botName,userId:payload.userId,autoCreation:true,appInfo:{botSource: "bot-builder", botType:"personal"},metadata:metadataObj,clientId:CLIENT_ID,businessId : localStorage.getItem('businessId'),
      organizationId : localStorage.getItem('organizationId')}
    formData.append('botObject', JSON.stringify(botObject))
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/initiate-bot-upsert`,formData,{
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    if(response.data.status.toLowerCase() === 'error') {
      return thunkAPI.rejectWithValue({ error: response.data.message });
    }
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue({ error: error.message });
  }
});

export const forgotPassword = createAsyncThunk("user/forgotPassword", async (data, thunkAPI) => {
  const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/forgot-password`, data, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (response && response?.data && response?.data?.status && response?.data.status.toLowerCase() === "error") {
    return thunkAPI.rejectWithValue(response.data);
  } else {
    return thunkAPI.fulfillWithValue(response.data);
  }
});


export const resetPassword = createAsyncThunk("user/resetPassword",async(data,thunkAPI)=>{
  const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/reset-password`,data,{
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if(response && response?.data && response?.data?.status && response?.data.status.toLowerCase() === "error") {
    return thunkAPI.rejectWithValue(response.data)
  }
  else{
    return thunkAPI.fulfillWithValue(response.data)
  }
})


