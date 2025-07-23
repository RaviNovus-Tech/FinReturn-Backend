/* 
 * Wraps an asynchronous function to handle errors in Express routes.
 * @param {function} fn - The asynchronous function to wrap.
 * @returns {function} A middleware function that handles errors.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };