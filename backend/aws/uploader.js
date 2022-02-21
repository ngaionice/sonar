import AWS from "aws-sdk";

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: process.env.AWS_S3_REGION,
});

/**
 * Uploads a file to S3. Returns a promise that, if resolved, contains the URL of the uploaded file.
 *
 * @param stream A file stream from an image.
 * @param name The name to be used for the file
 */
async function upload(stream, name) {
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: null,
    Body: null,
  };

  uploadParams.Key = name;
  uploadParams.Body = stream;

  try {
    const { Location: fileUrl } = await s3.upload(uploadParams).promise();
    return fileUrl;
  } catch (e) {
    console.log(`Failed to upload ${name}.`);
    throw e;
  }
}

export default upload;
