import bcrypt from "bcrypt";
import mongoose from "mongoose";
const saltRounds = 10;

/*
 * Hash a password using bcrypt.
 * @param {string} password - The password to hash.
 * @returns {string} The hashed password.
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

/*
 * Compare a plain text password with a hashed password.
 * @param {string} password - The plain text password.
 * @param {string} hashedPassword - The hashed password.
 * @returns {boolean} True if the passwords match, otherwise false.
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/*
 * Generate a random 6-digit OTP (One Time Password).
 * @returns {number} A 6-digit OTP.
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

/*
 * Generate an expiration time for the OTP.
 * @param {number} minutes - The number of minutes until the OTP expires (default: 5).
 * @returns {number} The expiration timestamp in milliseconds.
 */
export const generateOTPExpires = (minutes = 5) => {
  return new Date().getTime() + minutes * 60 * 1000;
};

/**
 * Converts string or array of strings to MongoDB ObjectId(s)
 * @param {string|string[]} input - The value(s) to convert
 * @returns {mongoose.Schema.Types.ObjectId|mongoose.Schema.Types.ObjectId[]} Converted ObjectId(s)
 * @throws {Error} When invalid ID format is provided
 */
export const stringToMongoIds = (input) => {
  if (Array.isArray(input)) {
    return input.map((item) => {
      // If item is already an ObjectId, return it directly
      if (item instanceof mongoose.Types.ObjectId) {
        return item;
      }
      return new mongoose.Types.ObjectId(item);
    });
  }

  // If input is already an ObjectId, return it directly
  if (input instanceof mongoose.Types.ObjectId) {
    return input;
  }

  return new mongoose.Types.ObjectId(input);
};

/*
 * Normalizes a value to an array. If the value is falsy, returns an empty array.
 * If the value is already an array, returns it as is.
 * Otherwise, wraps the value in an array.
 *
 * @param {any} val - The value to normalize
 * @returns {Array} Normalized array
 */
export const normalizeToArray = (val) => {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
};

/**#################### PIPELINE HELPERS ########################### */

/**
 * Creates a MongoDB aggregation $facet stage that handles pagination and allows extra pipeline stages.
 *
 * @param {Object} options
 * @param {number} options.page - The current page number (default: 1)
 * @param {number} options.perPage - Number of documents per page (default: 10)
 * @param {Object[]} options.extraStages - Additional aggregation pipeline stages to include in `data` facet
 * @param {Object} options.sort - Sort object for defining sort order (default: { createdAt: -1 })
 * @returns {Object} MongoDB $facet stage with metadata and paginated data
 */
export const paginationStage = ({
  page = 1,
  perPage = 10,
  stages = [],
  sort = { createdAt: -1 },
}) => {
  const skip = (parseInt(page) - 1) * parseInt(perPage);
  return {
    $facet: {
      metadata: [{ $count: "total" }],
      data: [
        ...stages,
        { $sort: sort },
        { $skip: skip },
        { $limit: parseInt(perPage) },
      ],
    },
  };
};

/**
 * Generates a MongoDB $or query object to match a keyword against multiple fields using case-insensitive regex.
 *
 * @param {string} keyword - The search keyword
 * @param {string[]} fields - The fields to search in
 * @returns {Object} MongoDB $or condition or an empty object
 */
export const keywordSearchStage = (keyword, fields = []) => {
  if (!keyword || !fields.length) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: keyword, $options: "i" },
    })),
  };
};

export const isvalidMongoId = (id) => {
  if (!id) return false;
  if (typeof id === "string") {
    return mongoose.Types.ObjectId.isValid(id);
  }
  return id instanceof mongoose.Types.ObjectId;
};
