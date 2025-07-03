// library/Fetcher.js
import axios from "axios";
import { app_url } from "../config/constants";
import useAuthStore from "../store/authStore";
// import useAuthStore from "../store/authStore";

class Fetcher {
  constructor() {
    this.axiosSetup = axios.create({
      baseURL: app_url,
      timeout: 20000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Company-Id": 1,
      },
    });

    this.attachInterceptors();
  }

  attachInterceptors = () => {
    // ✅ Request Interceptor: Add Bearer Token
    this.axiosSetup.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ✅ Response Interceptor: Handle 401
    this.axiosSetup.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().clearToken();

          // TODO: Show a toast or alert here
          // TODO: Navigate to login screen if needed
        }

        return Promise.reject(error);
      }
    );
  };

  get = (url, config = {}) => this.axiosSetup.get(url, config);
  post = (url, data = {}, config = {}) => this.axiosSetup.post(url, data, config);
  patch = (url, data = {}, config = {}) => this.axiosSetup.patch(url, data, config);
  put = (url, data = {}, config = {}) => this.axiosSetup.put(url, data, config);
}

export default new Fetcher();
