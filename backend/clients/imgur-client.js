import axios from "axios";

function getImgurClient() {
  return axios.create({
    baseURL: "https://api.imgur.com/3",
    timeout: 10000,
    headers: { Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` },
  });
}

export default getImgurClient;
