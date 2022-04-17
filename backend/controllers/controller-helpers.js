import axios from "axios";
import { getAllRoles } from "../database/user.js";

const getTags = (tagsString) => {
  let tags;
  if (tagsString) {
    const temp = JSON.parse(tagsString);
    tags = Array.isArray(temp) ? temp : [];
  } else {
    tags = [];
  }
  return tags;
};

const getRoles = (rolesString) => {
  if (rolesString) {
    const temp = JSON.parse(rolesString);
    return Array.isArray(temp) ? temp : [];
  }
  return [];
};

const getRolesValue = async (dbClient, roles) => {
  let rolesVal = 1;
  // TODO: add new db function to fetch only the roles that match the array
  const rolesArray = await getAllRoles(dbClient);
  roles.forEach((role) => {
    for (const roleObj of rolesArray) {
      if (role === roleObj.title) {
        rolesVal *= roleObj.id;
        break;
      }
    }
  });
  return rolesVal;
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
  const { tags: tagsString, isPublic, readRoles: readRolesString } = req.body;

  if (!isValidFiletype(mimetype)) {
    res.status(400).send("Invalid file type");
    throw new Error("Invalid file type");
  }

  if (size > 15728640) {
    res.status(400).send("File too large");
    throw new Error("File too large");
  }

  const tags = getTags(tagsString);
  const readRoles = getRoles(readRolesString);
  const name = getNewFilename(oldName);
  return {
    buffer,
    name,
    tags,
    readRoles,
    isPublic,
  };
};

const getDataFromUrl = async (req, res) => {
  const {
    tags: tagsString,
    isPublic,
    srcUrl,
    readRoles: readRolesString,
  } = req.body;
  const tags = getTags(tagsString);
  const readRoles = getRoles(readRolesString);

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
    readRoles,
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
 * Returns the next prime number.
 * @param {Set[number]} currRolesSet
 */
function getNextPrime(currRolesSet) {
  const first200Primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151,
    157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233,
    239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317,
    331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419,
    421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503,
    509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607,
    613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701,
    709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811,
    821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911,
    919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997, 1009, 1013,
    1019, 1021, 1031, 1033, 1039, 1049, 1051, 1061, 1063, 1069, 1087, 1091,
    1093, 1097, 1103, 1109, 1117, 1123, 1129, 1151, 1153, 1163, 1171, 1181,
    1187, 1193, 1201, 1213, 1217, 1223,
  ];
  for (const num of first200Primes) {
    if (!currRolesSet.has(num)) {
      return num;
    }
  }
  throw new Error("Only 200 roles are allowed at a time.");
}

export {
  getDataFromUpload,
  getDataFromUrl,
  getTags,
  getRoles,
  getRolesValue,
  getNextPrime,
  isAdmin,
};
