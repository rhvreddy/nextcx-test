import PropTypes from 'prop-types';
import {createContext, useEffect, useReducer} from 'react';
import {useDispatch} from "react-redux";
import {errorMessages} from "config";

// third-party
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

// ============================|| FIREBASE - REGISTER ||============================ //
var JWT_SECRET_KEY = 'LMS SECRET'

// action - state management
import {LOGIN, LOGOUT} from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project import
import Loader from 'components/Loader';
import {FIREBASE_API, REACT_APP_APP_BACK_END_BASE_URL} from 'config';
import jwt from "jsonwebtoken";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
// firebase initialize
if (!firebase.apps.length) {
  firebase.initializeApp(FIREBASE_API);
}

// const
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

// ==============================|| FIREBASE CONTEXT & PROVIDER ||============================== //

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({children}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const dispatcher = useDispatch()
  const navigate = useNavigate()

  const displayError = () => {
    toast.error(errorMessages?.networkError ? errorMessages?.networkError : "");
    navigate(`/error-page?errorCode=500&errorMessage=${errorMessages?.networkError ? errorMessages?.networkError : ""}`)
  }

  useEffect(() => {
    const handleOffline = () => {
      toast.error("You are offline. Please check your internet connection.",{autoClose:2000});
    };

    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        let userId = localStorage.getItem("userId")
        if (userId) {
          axios
            .get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/get-user-info/${userId}`)
            .then(async (res) => {
              if(res?.data?.status?.toLowerCase() === "success") {
                dispatch({
                  type: LOGIN,
                  payload: {
                    isLoggedIn: true,
                    user: {
                      id: res.data.userInfo.userId,
                      email: res.data.userInfo.email,
                      name: (res?.data?.userInfo?.firstName + ' ' + res?.data?.userInfo?.lastName) || 'Vamsi',
                      firstName: res?.data?.userInfo?.firstName,
                      lastName: res?.data?.userInfo?.lastName,
                      role: res?.data?.role ? res?.data?.role : 'Marketing Lead',
                      appRoles: res.data.userInfo?.appRoles
                    }
                  }
                });
              }
              else{
                toast.error(res?.data?.message);
                dispatch({
                  type: LOGIN,
                  payload: {
                    isLoggedIn: true,
                    user: {
                      id: userId
                    }
                  }
                });
                if(res?.data?.userNotFound){
                  navigate("/register");
                }
              }
            })
            .catch((error) => {
              displayError()
              dispatch({
                type: LOGIN,
                payload: {
                  isLoggedIn: true,
                  user: {
                    id: userId
                  }
                }
              });
            })


        } else {
          dispatch({
            type: LOGOUT
          });
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const firebaseEmailPasswordSignIn = (email, password) => firebase.auth().signInWithEmailAndPassword(email, password);


  const createAccount = (email, password, firstname, lastname, company) => {

    let userInfo = {
      email: email,
      password: password,
      firstName: firstname,
      lastName: lastname,
      company: company
    }
    const signedToken = jwt.sign(userInfo, JWT_SECRET_KEY);

    return axios
      .post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/signup-v2`, {tokenInfo: signedToken})
      .then(async (res) => {
        return {status: res.status, responseData: res.data}
      })
      .catch((error) => {
        throw new Error(`Could not process request - ${error.message}`)
      })
  };

  const signIn = (email, password) => {

    let userInfo = {
      email: email,
      password: password
    }
    const signedToken = jwt.sign(userInfo, JWT_SECRET_KEY);

    return axios
      .post(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/signin-v2`, {tokenInfo: signedToken})
      .then(async (res) => {
        if (res && res.data && res.data.status === "Success") {
          localStorage.setItem("userId", res.data.user.userId);
          localStorage.setItem("appRoles", JSON.stringify(res.data?.user?.appRoles));
          // let resUser = await getUserProfile(localStorage.getItem("userId"))
          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user: {
                id: res.data.user._id || "har",
                email: res.data.user.email || 'abc@gmail.com',
                name: (res?.data?.user?.firstName + ' ' + res?.data?.user?.lastName) || 'Vamsi',
                firstName: res.data.user.firstName,
                lastName: res.data.user.lastName,
                role: res?.data?.role ? res?.data?.designation : 'Marketing Lead',
                appRoles: res.data.user?.appRoles
              }
            }
          });
        }
        return {status: res.status, responseData: res.data, message: res?.message}
      })
      .catch((error) => {
        throw new Error(`Could not process request - ${error.message}`)
      })
  };

  const getUserProfile = (userId) => {
    return axios
      .get(`${REACT_APP_APP_BACK_END_BASE_URL}/v0/web/user/get-user-info/${userId}`)
      .then(async (res) => {
        return res;
      })
      .catch((error) => {
        throw new Error(`Could not process request - ${error.message}`)
      })
  }


  const firebaseGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  const firebaseTwitterSignIn = () => {
    const provider = new firebase.auth.TwitterAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  const firebaseFacebookSignIn = () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  const firebaseRegister = async (email, password) => firebase.auth().createUserWithEmailAndPassword(email, password);

  const logout = () => {
    localStorage.clear();
    dispatch({
      type: LOGOUT
    });
  }

  const resetPassword = async (email) => {
    await firebase.auth().sendPasswordResetEmail(email);
  };

  const updateProfile = () => {
  };
  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader/>;
  }

  return (
    <>
      <FirebaseContext.Provider
        value={{
          ...state,
          getUserProfile,
          createAccount,
          signIn,
          firebaseRegister,
          firebaseEmailPasswordSignIn,
          login: () => {
          },
          firebaseGoogleSignIn,
          firebaseTwitterSignIn,
          firebaseFacebookSignIn,
          logout,
          resetPassword,
          updateProfile
        }}
      >
        {children}
      </FirebaseContext.Provider>
    </>

  );
};

FirebaseProvider.propTypes = {
  children: PropTypes.node
};

export default FirebaseContext;
