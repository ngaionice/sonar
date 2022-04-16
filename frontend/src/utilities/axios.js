import axios from "axios";

let refreshCall = null;
let tokens = null;
let baseUrl = localStorage.getItem("server-url");
let setUser = () => {};

function storeTokens(tokens) {
  setUser({ type: "refresh", payload: { tokens } });
}

function createAxiosInstance() {
  const inst = axios.create({
    baseURL: `${baseUrl}/api`,
    timeout: 5000,
  });

  inst.interceptors.request.use(
    (request) => {
      if (request.url.match(/^(?:\/files|users)\/\w+/)) {
        request.headers.Authorization = `Bearer ${tokens?.access?.token}`;
      }
      console.log(request);
      return request;
    },
    (err) => Promise.reject(err)
  );

  inst.interceptors.response.use(
    (response) => response,
    async (err) => {
      const config = err.config;
      if (err.response && err.response.status === 401 && !config._refreshed) {
        config._refreshed = true;
        try {
          refreshCall = refreshCall ?? refreshTokens();
          const { data } = await refreshCall;
          refreshCall = null;
          storeTokens(data.tokens);
          config.headers.Authorization = `Bearer ${data.tokens.access.token}`;
          return instance(config);
        } catch (e) {
          refreshCall = null;
          return Promise.reject(e);
        }
      }
      return Promise.reject(err);
    }
  );
  return inst;
}

let instance = createAxiosInstance();

async function refreshTokens() {
  return instance.post(`/auth/refresh`, {
    token: tokens?.refresh?.token,
  });
}

function updateInstance(newUrl, newTokens, newSetUser) {
  baseUrl = newUrl;
  tokens = newTokens;
  setUser = newSetUser;
  instance = createAxiosInstance();
}

export { instance as axios, updateInstance };
