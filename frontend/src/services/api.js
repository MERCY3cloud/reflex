import axios from "axios";

const api = axios.create({
baseURL: "http://127.0.0.1:8000/api",
headers: {
"Content-Type": "application/json",
},
});

api.interceptors.request.use(
(config) => {
const token = localStorage.getItem("accessToken");


    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
},
(error) => {
    return Promise.reject(error);
}


);

// Response interceptor: on 401 try to refresh access token once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                // no refresh token, redirect to login
                window.location.href = "/login";
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            try {
                const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", { refresh: refreshToken });
                const newAccess = response.data.access;
                localStorage.setItem("accessToken", newAccess);
                api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
                processQueue(null, newAccess);
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
