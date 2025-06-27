import axios from "axios";
import { app_url } from "../config/constants"
import useAuthStore from "../store/authStore" // Import Auth Store

class Fetcher {
  constructor() {
    this.axiosSetup = null;
    this.setup();
  }

  setup = async () => {
    this.axiosSetup = axios.create({
      baseURL: app_url,
      timeout: 20000,
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
        "Company-Id": 1,
      },
    });

    // ✅ Attach Bearer Token
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

    // ✅ Error Handling
    this.axiosSetup.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status } = error.response;

          if (status === 401) {
            // ⭐ 1. Clear token
            useAuthStore.getState().clearToken();

            // ⭐ 2. Toast Message

            // ⭐ 3. Redirect to Login
            // Router.replace("/login"); // ✅ Important: use replace, not push
          }
        }

        return Promise.reject(error);
      }
    );
  };

  get = (route, params) => {
    return this.axiosSetup.get(route, params);
  };

  post = (route, params, extra) => {
    return this.axiosSetup.post(route, params, extra);
  };

  patch = (route, params, extra) => {
    return this.axiosSetup.patch(route, params, extra);
  };

  put = (route, params, extra) => {
    return this.axiosSetup.put(route, params, extra);
  };
}

export default new Fetcher();
