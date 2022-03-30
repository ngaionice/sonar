import FormData from "form-data";
import axios from "axios";

function getImgurClient() {
  return axios.create({
    baseURL: "https://api.imgur.com/3",
    timeout: 10000,
    headers: { Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` },
  });
}
/**
 * Uploads a file to Imgur. Returns a promise that, if resolved, contains an object containing information about the uploaded file.
 * Current fields include
 * - `url`: the URL of the uploaded file
 * - `deleteHash`: the hash required to delete the uploaded file from Imgur.
 *
 * @param buffer A buffer of an image.
 * @return {Promise<{deleteHash: string, url: string}>}
 */
async function upload(buffer) {
  const imgurFormData = new FormData();
  imgurFormData.append("image", buffer);
  imgurFormData.append("type", "file");

  try {
    const { data } = await getImgurClient().post("/image", imgurFormData, {
      headers: imgurFormData.getHeaders(),
    });
    const { deletehash: deleteHash, link } = data.data;
    return { deleteHash, url: link };
  } catch (e) {
    console.log("Failed to upload to Imgur.");
    throw e;
  }
}

/**
 * Deletes the Imgur images specified by the input hashes.
 * @param {string[]} hashes An array of Imgur hashes
 * @return {Promise<string[]>} A promise when resolved, contains a list of hashes that failed.
 */
async function remove(hashes) {
  const client = getImgurClient();
  const deletions = hashes.map((h) => {
    client.delete(`/image/${h}`);
  });
  const output = await Promise.allSettled(deletions);
  const failed = [];
  for (let i = 0; i < hashes.length; i++) {
    if (output[i].status !== "fulfilled") {
      failed.push(hashes[i]);
    }
  }
  return failed;
}

export { remove, upload };
