import axios from "axios";

export const API = axios.create({
  baseURL: import.meta.env.VITE_BE_LINK,
});

API.interceptors.request.use(
  (request) => {
    // const token =
    //   sessionStorage.getItem("token") || localStorage.getItem("token");
    // if (token) {
    //   request.headers.Authorization = `Bearer ${token}`;
    // }

    return request;
  },
  () => Promise.reject()
);
