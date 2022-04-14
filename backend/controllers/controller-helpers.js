import axios from "axios";

const getTags = (tagsString) => {
  let tags;
  if (tagsString) {
    const temp = JSON.parse(tagsString);
    tags = Array.isArray(temp) ? temp : [];
  } else {
    tags = [];
  }
  if (tags.length < 1) {
    tags.push("untagged");
  }
  return tags;
};

const getNewFilename = (filename, extension) =>
  String(Math.floor(Date.now() / 1000)).concat(
    "-",
    filename ?? "image",
    extension ? "." + extension : ""
  );

const isValidFiletype = (type) => {
  const allowedTypesPrefix = /image\//;
  return type.search(allowedTypesPrefix) === 0;
};

const getDataFromUpload = (req, res) => {
  const { buffer, size, mimetype, originalname: oldName } = req.file;
  const { tags: tagsString, isPublic } = req.body;

  if (!isValidFiletype(mimetype)) {
    res.status(400).send("Invalid file type");
    throw new Error("Invalid file type");
  }

  if (size > 15728640) {
    res.status(400).send("File too large");
    throw new Error("File too large");
  }

  const tags = getTags(tagsString);
  const name = getNewFilename(oldName);
  return {
    buffer,
    name,
    tags,
    isPublic,
  };
};

const getDataFromUrl = async (req, res) => {
  const { tags: tagsString, isPublic, srcUrl } = req.body;
  const tags = getTags(tagsString);

  if (!srcUrl) {
    res.status(400).send("No URL found");
    throw new Error("No URL found");
  }

  const image = await axios.get(srcUrl, {
    responseType: "arraybuffer",
    timeout: 30000, // times out after 30s
  });
  if (!isValidFiletype(image.headers["content-type"])) {
    res.status(400).send("Invalid file type");
    throw new Error("Invalid file type");
  }
  if (image.data.byteLength > 15728640) {
    res.status(400).send("File too large");
    throw new Error("File too large");
  }

  const buffer = Buffer.from(image.data, "utf-8");

  const name = getNewFilename(
    "image",
    image.headers["content-type"].substring(6)
  );

  return {
    buffer,
    name,
    tags,
    isPublic,
  };
};

/**
 *
 * @param {number[]} roles The roles array.
 * @return {boolean} True if the roles array indicates that the user is an array, false otherwise.
 */
const isAdmin = (roles) => roles && Array.isArray(roles) && roles.includes(1);

/**
 * Returns the next prime number. Code borrowed from Wikipedia page: Primality test
 * @param {number} start
 */
function getNextPrime(start) {
  if (start < 2) return 2;
  if (start < 3) return 3;
  for (let num = start; num < 2 * start; num++) {
    if (num <= 3) continue;
    if (num % 2 === 0 || num % 3 === 0) continue;

    let count = 5;
    while (Math.pow(count, 2) <= num) {
      if (num % count === 0 || num % (count + 2) === 0) continue;
      count += 6;
    }

    return num;
  }
  throw new Error("Failed to find next prime.");
}

export { getDataFromUpload, getDataFromUrl, getNextPrime, isAdmin };
