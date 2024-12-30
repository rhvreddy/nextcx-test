// third-party
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

// project imports
import customDummyAxios from 'utils/axios';
import axios from 'axios';

import {dispatch} from '../index';
import {CLIENT_ID, REACT_APP_APP_BACK_END_BASE_URL} from '../../config';

// ----------------------------------------------------------------------
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

const initialState = {
  loading: false,
  deleting: false,
  error: null,
  chats: [],
  user: {},
  users: [],
  records: [],
  authTokenInfo: {},
  bearerInfo: {},
  chatCustomSettings: {},
  userJoinInfo: {},
  fileUploadInfo: {},
  botReplyResponseInfo: {},
  allChatBotAgents:[],
  allChatBotAgentsBasicToken:{},
};

const chat = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // HAS ERROR
    hasError(state, action) {
      state.error = action.payload;
    },
    hasErrorInBotReply(state, action) {
      state.botErrorReply = action.payload;
    },
    renderChatContainer(state, action) {
      state.render = action.payload
    },
    //GET Latest botInfo
    getLatestBotInfoSuccess(state, action) {
      state.botInfo = action.payload
      state.botStatus = action.payload.data[0].status
      state.fetching = false
    },
    // GET Auth Token
    getAuthTokenInfoSuccess(state, action) {
      state.authTokenInfo = action.payload;
    },
    getAllChatBotAgentsAuthToken(state, action) {
      state.allChatBotAgentsBasicToken = action.payload;
    },

    getChatBearerInfoSuccess(state, action) {
      state.bearerInfo = action.payload;
    },
    getChatCustomSettingsSuccess(state, action) {
      state.chatCustomSettings = action.payload;
    },
    getUserJoinSuccess(state, action) {
      state.userJoinInfo = action.payload;
    },

    getBotReplyResponseSuccess(state, action) {
      state.botReplyResponseInfo = action.payload;
    },
    getFileUploadSuccess(state, action) {
      state.fileUploadInfo = action.payload.fileInfo
    },
    clearChatFileState(state, action) {
      state.fileUploadInfo = {}
    },

    // GET USER
    getUserSuccess(state, action) {
      state.user = action.payload;
    },

    //history by conversationId response
    historyResponseByConversationId(state, action) {
      state.historyResponse = action.payload
    },
    allChatHistory(state, action) {
      state.allChatHistory = action.payload
    },
    isResFetching(state, action) {
      state.isResFetching = action.payload.isDisabled
    },
    setIsNewChatInitiating(state, action) {
      state.isNewChatInitiating = action.payload
    },

    // GET USER CHATS
    getUserChatsSuccess(state, action) {
      state.chats = action.payload;
    },
    // GET USERS
    getUsersSuccess(state, action) {
      state.users = action.payload;
    },
    getSelectedConvId(state, action) {
      state.selectedConversation = action.payload
    },
    fetchAllNotifications(state, action) {
      state.allNotifications = []
      state.allNotifications = [...state.allNotifications, action.payload]
    },
    getNotification(state, action) {
      state.isNotification = action.payload
    },
    displayChatComponent(state,action){
      state.openChatWindow = action.payload
    },
    disableAppointmentSaveBtn(state,action){
      state.disableSaveBtn = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFileToS3.pending, (state) => {
        state.uploading = true
      })
      .addCase(uploadFileToS3.fulfilled, (state, action) => {
        state.uploading = false
        state.fileUploadInfo = action.payload.fileInfo
        state.error = action.payload.error
      })
      .addCase(uploadFileToS3.rejected, (state, action) => {
        state.uploading = false
        state.error = action.payload.error
      })
      .addCase(deleteConversationById.pending, (state) => {
        state.deleting = true
      })
      .addCase(deleteConversationById.fulfilled, (state, action) => {
        state.deleting = false
        state.error = null
      })
      .addCase(deleteConversationById.rejected, (state, action) => {
        state.deleting = false
        state.error = action.payload.error
      })
      .addCase(getHistoryByConversationId.pending, (state) => {
        state.loading = true
      })
      .addCase(getHistoryByConversationId.fulfilled, (state, action) => {
        state.loading = false
        state.historyResponse = action.payload
        state.error = null
      })
      .addCase(getHistoryByConversationId.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.error
      })
      .addCase(getLatestBotByUserId.pending, (state) => {
        state.loading = true
      })
      .addCase(getLatestBotByUserId.fulfilled, (state, action) => {
        state.loading = false
        state.botInfo = action?.payload
        state.botRecords = action?.payload?.data
        if (action?.payload?.data && action?.payload?.data[0]) {
          state.botStatus = action?.payload?.data[0]?.status
        } else {
          state.botStatus = ""
        }
        state.fetching = false
      })
      .addCase(getLatestBotByUserId.rejected, (state, action) => {
        delete state?.botInfo
        state.loading = false
        state.error = action?.payload?.error

      })
      .addCase(fetchUsersByInterpreterId.pending, (state) => {
        state.isUsersFetching = true
      })
      .addCase(fetchUsersByInterpreterId.fulfilled, (state, action) => {
        state.isUsersFetching = false
        state.usersListByBotId = {isUsersFetched: true, usersList: action.payload?.results};
      })
      .addCase(fetchUsersByInterpreterId.rejected, (state, action) => {
        state.isUsersFetching = false
        state.usersFetchingError = true
        state.error = action.payload.error
      })
      .addCase(getAllBotsByBizId.fulfilled,function(state,action){
        state.allChatBotAgents = action.payload?.results || [];
      })
  }
});

export const {clearChatFileState, getSelectedConvId, displayChatComponent, setIsNewChatInitiating,disableAppointmentSaveBtn} = chat.actions
// Reducer
export default chat.reducer;

// ----------------------------------------------------------------------
export const getLatestBotByUserId = createAsyncThunk('chat/latestBot', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/get-all-bots-by-criteria`, data, {
      params: {
        searchTerm: "",
        skip: 0,
        limit: 50
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    })
    if (response.status === 200) {
      const {data} = response?.data
      if (data && data?.length > 0) {
        return response?.data
      } else {
        return thunkAPI.rejectWithValue({error: 'No bot records'});
      }
    }
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error?.message});
  }
})

export const getAllBotsByBizId = createAsyncThunk('chat/getAllBotsByBizId', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/get-interpreterIds-by-bizId`, data, {
      params: {
        searchTerm: "",
        skip: 0,
        limit: 50
      },
      headers: {
        'Content-Type': 'application/json'
      },
    })
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error?.message});
  }
})

export const deleteBot = createAsyncThunk("chat/deleteBot",async function(data, thunkAPI){
  try{
    //conversation deletion api - /ai-bots/v0/delete-conversation
    //update bot api - /ai-bots/v0/update-bot-status-by-record-id
    let response = await axios.post(REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/update-bot-status-by-record-id`,data)
    if(response.data?.status?.toLowerCase() === "success"){
      return thunkAPI.fulfillWithValue(response.data);
    }
    else{
      return thunkAPI.rejectWithValue(response.data);
    }
  }
  catch(err){
    return thunkAPI.rejectWithValue({
      status:"error",
      message:'Error occurred while processing the request. Please try again',
      error:err?.message
    })
  }
})

export const deleteConversation = createAsyncThunk("chat/deleteConversation",async function(data, thunkAPI){
  try{
    let response = await axios.post(REACT_APP_APP_BACK_END_BASE_URL + `/ai-bots/v0/delete-conversation`,data)
    if(response.data?.status?.toLowerCase() === "success"){
      return thunkAPI.fulfillWithValue(response.data);
    }
    else{
      return thunkAPI.rejectWithValue(response.data);
    }
  }
  catch(err){
    return thunkAPI.rejectWithValue({
      status:"error",
      message:'Error occurred while processing the request. Please try again',
      error:err?.message
    })
  }
})

export function renderChatContainer(val) {
  return dispatch(chat.actions.renderChatContainer(val))
}

export function getChatBasicToken(tokenInfo) {
  return async (dispatch) => { // dispatch as a parameter
    try {
      let basicTokenURL = `${process.env.REACT_APP_APP_BACK_END_BASE_URL}/ai-widget-api/v0/nlu/get/basic-token`;
      //console.log('tokenInfo ->', tokenInfo, ' , basicTokenURL ->', basicTokenURL);

      const response = await axios.post(basicTokenURL, tokenInfo); // await for the response
      dispatch(chat.actions.getAuthTokenInfoSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getAllChatBotAgentsBasicToken(tokenInfo) {
  return async (dispatch) => { // dispatch as a parameter
    try {
      let basicTokenURL = `${process.env.REACT_APP_APP_BACK_END_BASE_URL}/ai-widget-api/v0/nlu/get/basic-token`;
      //console.log('tokenInfo ->', tokenInfo, ' , basicTokenURL ->', basicTokenURL);

      const response = await axios.post(basicTokenURL, tokenInfo); // await for the response
      dispatch(chat.actions.getAllChatBotAgentsAuthToken(response.data));
    } catch (error) {
      //error occurred
      console.log("error occurred while fetching basic token",err)
    }
  };
}


export function getChatBearerToken(data) {
  return async () => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/oauth/0.1/token`, {grant_type: 'client_credentials'}, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${data.access_token}`
        }
      })
      //console.log('getChatBearerToken ->', data, '->', response.data);
      dispatch(chat.actions.getChatBearerInfoSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getChatCustomSettings(data, headers) {
  if (data && data?.publishStatus) {
    data.publishStatus = "Y"
  }
  return async () => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-nlu-api/v3/nlu/agent-chat-settings`, data, {
        headers: headers
      })
      // console.log('getChatCustomSettings ->', data, '->', response.data);
      //dispatch(chat.actions.getChatCustomSettingsSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUserJoin(data, headers) {
  return async () => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-nlu-api/v3/nlu/user-interact/join`, data, {
        headers: headers
      })
      //dispatch(chat.actions.getUserJoinSuccess(response.data));
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export const getHistoryByConversationId = createAsyncThunk('chat/getHistoryByConversationId', async (payload, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-nlu-api/v3/nlu/agent-chat-history-by-conversationId`, payload.data, {
      headers: payload.headers
    })
    return response.data
    // return response;
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})

export function getChatHistory(data, headers) {
  return async () => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-nlu-api/v3/nlu/agent-chat-history`, data, {
        headers: headers
      })
      response?.data?.reverse()
      dispatch(chat.actions.allChatHistory(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
      dispatch(chat.actions.hasErrorInBotReply(error));
    }
  };
}


export const fetchUsersByInterpreterId = createAsyncThunk('chat/fetchUsersByInterpreterId', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/worker/get-userId-by-interpreterId`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})


export function getBotReplyResponse(data, headers) {
  return async () => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-nlu-api/v3/nlu/agent-interact/message`, data, {
        headers: headers
      });
      dispatch(chat.actions.getBotReplyResponseSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
      dispatch(chat.actions.hasErrorInBotReply(error));
    }
  };
}

export function getBotUploadedDocumentResposne(data, file, headers) {
  return async (dispatch) => {
    try {
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('document', file);
      formData.append('data', JSON.stringify(data));

      // Update the API endpoint to handle file uploads
      const response = await axios.post(
        `${REACT_APP_APP_BACK_END_BASE_URL}/ai-nlu-api/v3/nlu/agent-interact/upload-doc-message`,
        formData,
        {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      dispatch(chat.actions.getBotReplyResponseSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export const uploadFileToS3 = createAsyncThunk('chat/upload', async (uploadInfo, thunkAPI) => {
  try {
    const formData = new FormData()
    formData.append('uploadFileInfo', uploadInfo.file)
    formData.append('botId', uploadInfo.botId)
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/file-upload`,
      formData,
      {
        headers: {
          ...uploadInfo.headers,
          'Content-Type': 'multipart/form-data'
        }
      })
    return response.data
  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})

export const deleteConversationById = createAsyncThunk('chat/delete', async (updateInfo, thunkAPI) => {
  try {
    const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/delete-conversation`, updateInfo)
    if (response) {
      if (response.data) {
        return response.data
      } else {
        return thunkAPI.rejectWithValue({error: response.message});
      }
    }

  } catch (error) {
    return thunkAPI.rejectWithValue({error: error.message});
  }
})


export function getUser(id) {
  return async () => {
    try {
      const response = await customDummyAxios.post('/api/chat/users/id', {id});
      dispatch(chat.actions.getUserSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUserChats(user) {
  return async () => {
    try {
      const response = await customDummyAxios.post('/api/chat/filter', {user});
      dispatch(chat.actions.getUserChatsSuccess(response.data));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function insertChat(chat) {
  return async () => {
    try {
      await customDummyAxios.post('/api/chat/insert', chat);
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function getUsers() {
  return async () => {
    try {
      const response = await customDummyAxios.get('/api/chat/users');
      dispatch(chat.actions.getUsersSuccess(response.data.users));
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

//Disabling sidebar list
export function disableNavItems(data) {
  return dispatch(chat.actions.isResFetching(data))
}

export function initiateBotUpsert(data) {
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
  formData.append('botObject', JSON.stringify(data));
  return async () => {
    try {
      const response = await axios.post(`${REACT_APP_APP_BACK_END_BASE_URL}/ai-bots/v0/initiate-bot-upsert`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error));
    }
  };
}

export function fetchNotifications(data) {
  return async () => {
    try {
      const response = await axios.get(`${REACT_APP_APP_BACK_END_BASE_URL}/v1/get-notification?userId=${data.id}&skip=${data.skip}&limit=${data.limit}`, {headers: {'Content-Type': 'application/json'}});
      dispatch(chat.actions.fetchAllNotifications(response.data))
    } catch (error) {
      dispatch(chat.actions.hasError(error.message));
    }
  };
}

//On read notifications reset to empty
export function OnReadNotifications(data) {
  return async () => {
    try {
      const response = await axios.post
      (`${REACT_APP_APP_BACK_END_BASE_URL}/v1/update-notification`,
        data, {headers: {'Content-Type': 'application/json'}})
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error.message));
    }
  }
}

export function fetchAllBookingSlots(data) {
  return async () => {
    try {
      const response = await axios.post
      (`${REACT_APP_APP_BACK_END_BASE_URL}/calendar/get-client-busy-schedule`,
          data, {headers: {'Content-Type': 'application/json'}})
      return response;
    } catch (error) {
      dispatch(chat.actions.hasError(error.message));
    }
  }
}

//Triggering from widget on file upload for notifications
export function triggerNotification(data) {
  return dispatch(chat.actions.getNotification(data))
}
