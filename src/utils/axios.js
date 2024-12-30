import axios from 'axios';
import { REACT_APP_APP_BACK_END_BASE_URL } from '../config';

const axiosServices = axios.create(
  {
    baseURL: REACT_APP_APP_BACK_END_BASE_URL,
  }
);

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Wrong Services')
);

export default axiosServices;
