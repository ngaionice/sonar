import FormData from "form-data";
import axios from "axios";

function getImgurClient() {
  return axios.create({
    baseURL: "https://api.imgur.com/3",
    timeout: 10000,
    headers: { Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` },
  });
}

async function upload(buffer) {
  const obj = {};

  const imgurFormData = new FormData();
  imgurFormData.append("image", buffer);
  imgurFormData.append("type", "file");

  try {
    const { data } = await getImgurClient().post("/image", imgurFormData, {
      headers: imgurFormData.getHeaders(),
    });
    const { deletehash: deleteHash, link } = data.data;
    obj.imgur = { deleteHash, url: link };
  } catch (e) {
    console.log("Failed to upload to Imgur.");
    throw e;
  }

  return obj;
}

export default upload;
