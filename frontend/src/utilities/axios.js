import axios from "axios";

async function refreshTokens(baseUrl, token) {
  return axios.post(`${baseUrl}/api/auth/refresh`, { token });
}

function storeTokens(setUser, tokens) {
  setUser({ type: "refresh", payload: { tokens } });
}

function getAxiosInstance(baseUrl, setUser, refreshToken) {
  const instance = axios.create({
    baseURL: `${baseUrl}/api`,
    timeout: 5000,
  });

  instance.interceptors.response.use(
    (response) => response,
    async (err) => {
      const config = err.config;
      if (err.response && err.response.status === 401 && !config._refreshed) {
        config._refreshed = true;
        try {
          const { data } = await refreshTokens(baseUrl, refreshToken);
          storeTokens(setUser, data.tokens);
          config.headers.Authorization = `Bearer ${data.tokens.access.token}`;
          return instance(config);
        } catch (e) {
          return Promise.reject(e);
        }
      }
      return Promise.reject(err);
    }
  );
  return instance;
}

export default getAxiosInstance;
