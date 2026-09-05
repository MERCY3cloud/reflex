import api from "./api";

export const login = async (username, password) => {
const response = await api.post("/token/", {
username: username,
password: password,
});


localStorage.setItem("accessToken", response.data.access);
localStorage.setItem("refreshToken", response.data.refresh);

// fetch current user
try {
	const me = await api.get("/auth/me/");
	return { tokens: response.data, user: me.data };
} catch (err) {
	return { tokens: response.data };
}


};

export const logout = () => {
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
};

export const getAccessToken = () => {
return localStorage.getItem("accessToken");
};

export const getRefreshToken = () => {
return localStorage.getItem("refreshToken");
};

export const isAuthenticated = () => {
return Boolean(getAccessToken());
};
