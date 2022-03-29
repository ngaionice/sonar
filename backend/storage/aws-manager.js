import AWS from "aws-sdk";

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
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: null,
    Body: null,
  };

  uploadParams.Key = name;
  uploadParams.Body = buffer;

  try {
    const { Location: url, Key: key } = await s3.upload(uploadParams).promise();
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
  const signingParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    Expires: 3600,
  };
  return s3.getSignedUrl("getObject", signingParams);
}

export { upload, generateSignedUrl };
