export const drawerWidth = 260;
export const widgetStyles = {height: "450px", width: "400px", initialHeight: "580px",containerHeight:"520px"}

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';


export const REACT_APP_APP_S_CODE = process.env.REACT_APP_APP_S_CODE;
export const REACT_APP_APP_BACK_END_BASE_URL = process.env.REACT_APP_APP_BACK_END_BASE_URL;
export const CLIENT_ID = "czIzLTMzNzgxMS05MTkyMjc2OTA1";
export const AUTH_KEY = "SFlZSVlCSFNISlNESlNESks="
export const REACT_APP_SIA_APP_BACK_END_BASE_URL = process.env.REACT_APP_SIA_APP_BACK_END_BASE_URL;

export const APP_NLU_URL = REACT_APP_APP_BACK_END_BASE_URL + "/ai-nlu-api/v3";

export const REACT_APP_CF_URL = process.env.REACT_APP_CF_URL

export const FIREBASE_API = {
  apiKey: 'AIzaSyC74w_JCigORyepa_esLkPt-B3HgtI_X3o',
  authDomain: 'mantis-4040b.firebaseapp.com',
  projectId: 'mantis-4040b',
  storageBucket: 'mantis-4040b.appspot.com',
  messagingSenderId: '1073498457348',
  appId: '1:1073498457348:web:268210e18c8f2cab30fc51',
  measurementId: 'G-7SP8EXFS48'
};

export const AWS_API = {
  poolId: 'us-east-1_AOfOTXLvD',
  appClientId: '3eau2osduslvb7vks3vsh9t7b0'
};

export const JWT_API = {
  secret: 'SECRET-KEY',
  timeout: '1 days'
};

export const AUTH0_API = {
  client_id: '7T4IlWis4DKHSbG8JAye4Ipk0rvXkH9V',
  domain: 'dev-w0-vxep3.us.auth0.com'
};

export const errorMessages = {
  "networkError":"Network interruption encountered. Please check your connection and retry again."
}

export const footerDisabledPages = ["all-chatbot-agents","admin"]
export const FILE_UPLOAD_DEFAULT_MESSAGE = "/file-upload"

export const appRoles = {userRole: "ai_bbad_5421", adminRole: "ai_bbadmin_9753", superAdminRole: "ai_bbsuperadmin_3456",masterAdminRole:"ai_bbmasteradmin_9876"}

// ==============================|| THEME CONFIG  ||============================== //

const config = {
  defaultPath: '/bot/wizard',
  accessDenied: '/access-denied',
  pricingPage: '/pricing',
  fontFamily: `Poppins, sans-serif`,
  i18n: 'en',
  miniDrawer: true,
  container: true,
  mode: 'light',
  presetColor: 'default',
  themeDirection: 'ltr'
};

export default config;
