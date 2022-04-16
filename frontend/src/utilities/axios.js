import axios from "axios";

async function refreshTokens(baseUrl, token) {
  return axios.post(`${baseUrl}/api/auth/refresh`, { token });
}

function storeTokens(setUser, tokens) {
  setUser({ type: "refresh", payload: { tokens } });
}

function getAxiosInstance(baseUrl, setUser, refreshToken, refreshTokenCall) {
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
          refreshTokenCall.current =
            refreshTokenCall.current ?? refreshTokens(baseUrl, refreshToken);
          const { data } = await refreshTokenCall.current;
          refreshTokenCall.current = null;
          storeTokens(setUser, data.tokens);
          config.headers.Authorization = `Bearer ${data.tokens.access.token}`;
          return instance(config);
        } catch (e) {
          refreshTokenCall.current = null;
          return Promise.reject(e);
        }
      }
      return Promise.reject(err);
    }
  );
  return instance;
}

export default getAxiosInstance;
