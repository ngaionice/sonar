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

export { getDataFromUpload, getDataFromUrl };
