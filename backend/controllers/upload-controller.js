import fs from "fs";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";

import uploadToAws from "../aws/uploader.js";
import getImgurClient from "../clients/imgur-client.js";

function getStream(path, isFromInternet) {
  if (isFromInternet === true) {
    // TODO: do something to download file and create stream
  } else if (isFromInternet === false) {
    return () => fs.createReadStream(path);
  } else {
    throw new Error("No input provided for isFromInternet.");
  }
}

/**
 * Uploads a local file to AWS, and to Imgur if `uploadToImgur` is `true`.
 * @param path The path to the file to be uploaded.
 * @param fileName The desired filename, excluding the extension.
 * @param uploadToImgur True if the file should be uploaded to imgur at the same time.
 * @return {Promise<Object | void>} A promise that when resolved, contains an object with at most two attributes: `aws` and `imgur`.
 * `aws` is always included. `imgur` is included if `uploadToImgur` is `true`.
 *
 * Both are objects that contain the attribute `url`, which holds the URL of the file on that site. `imgur` also includes the attribute `deleteHash` if `uploadToImgur` is `true`, which can be used to delete the image from Imgur.
 */
async function uploadFromLocal(path, fileName, uploadToImgur = true) {
  const ext = path.split(".").pop();
  return await upload(getStream(path, false), fileName, ext, uploadToImgur);
}

/**
 *
 * @param url The URL to the file to be uploaded.
 * @param fileName The desired filename, excluding the extension.
 * @param uploadToImgur True if the file should be uploaded to imgur at the same time.
 * @return {Promise<Object | void>} A promise that when resolved, contains an object with at most two attributes: `aws` and `imgur`.
 * `aws` is always included. `imgur` is included if `uploadToImgur` is `true`.
 *
 * Both are objects that contain the attribute `url`, which holds the URL of the file on that site. `imgur` also includes the attribute `deleteHash` if `uploadToImgur` is `true`, which can be used to delete the image from Imgur.
 */
async function uploadFromInternet(url, fileName, uploadToImgur = true) {
  const ext = url.split(".").pop();
  return await upload(getStream(url, true), fileName, ext, uploadToImgur);
}

/**
 * Uploads a file to AWS, and to Imgur if `uploadToImgur` is `true`.
 * @param getFilestream A function that when executed, returns a filestream of the file to be inserted.
 * @param fileName The desired filename, excluding the extension. To use a randomly generated one, set this value to an empty string/null/undefined.
 * @param extension The extension of the file. E.g. `png`, `jpg`.
 * @param uploadToImgur True if the file should be uploaded to imgur at the same time.
 * @return {Promise<Object | void>} A promise that when resolved, contains an object with at most two attributes: `aws` and `imgur`.
 * `aws` is always included. `imgur` is included if `uploadToImgur` is `true`.
 *
 * Both are objects that contain the attribute `url`, which holds the URL of the file on that site. `imgur` also includes the attribute `deleteHash` if `uploadToImgur` is `true`, which can be used to delete the image from Imgur.
 */
async function upload(getFilestream, fileName, extension, uploadToImgur) {
  // upload to AWS
  // then upload to Imgur
  // we don't want the image to be on Imgur but not AWS, while the converse is acceptable.

  const name = (fileName || uuidv4()) + "." + extension;
  const obj = {};

  let filestream;
  try {
    filestream = getFilestream();
    const awsUrl = await uploadToAws(filestream, name);
    filestream.close();
    obj.aws = { url: awsUrl };
  } catch (e) {
    console.log("Failed to upload to AWS.");
    throw e;
  }

  if (uploadToImgur) {
    const imgurFormData = new FormData();
    filestream = getFilestream();
    imgurFormData.append("image", filestream);
    imgurFormData.append("type", "file");
    imgurFormData.append("name", name);
    imgurFormData.append("description", "");

    try {
      const { data } = await getImgurClient().post("/image", imgurFormData, {
        headers: imgurFormData.getHeaders(),
      });
      filestream.close();
      const { deletehash: deleteHash, link } = data.data;
      obj.imgur = { deleteHash, url: link };
    } catch (e) {
      console.log(
        "Successfully uploaded to AWS, but failed to upload to Imgur."
      );
      throw e;
    }
  }

  // TODO: insert aws url, imgur insertion data into database
  return obj;
}

export { uploadFromLocal, uploadFromInternet };
