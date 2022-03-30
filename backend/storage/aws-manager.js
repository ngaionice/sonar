import AWS from "aws-sdk";
import { promisify } from "util";

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: process.env.AWS_S3_REGION,
});

/**
 * Uploads a file to S3. Returns a promise that, if resolved, contains an object containing information about the uploaded file.
 * Current fields include
 * - `url`: the URL of the uploaded file
 * - `key`: the key of the uploaded file in the bucket it was uploaded to
 *
 * @param buffer A buffer of an image.
 * @param name The name to be used for the file
 * @return {Promise<{key: string, url: string}>}
 */
async function upload(buffer, name) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: null,
    Body: null,
  };

  params.Key = name;
  params.Body = buffer;

  try {
    const { Location: url, Key: key } = await s3.upload(params).promise();
    return { url, key };
  } catch (e) {
    console.log(`Failed to upload ${name}.`);
    throw e;
  }
}

/**
 * Returns a URL that allows read access to the input key, with an expiry time of 1 hour.
 *
 * @param key The key of the file
 * @return {string} The signed URL that can be used for viewing the file
 */
function generateSignedUrl(key) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: 3600,
  };
  return s3.getSignedUrl("getObject", params);
}

/**
 * Deletes images matching the input array of keys.
 * @param {string[]} keys An array of image keys.
 * @return {Promise<void>}
 */
async function remove(keys) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: {
      Objects: keys.map((k) => ({ Key: k })),
      Quiet: true,
    },
  };
  const deleteFromS3 = promisify(s3.deleteObjects);

  let res = await deleteFromS3(params);
  // TODO: clean up this part after testing
  console.log(res);
}

export { generateSignedUrl, remove, upload };
