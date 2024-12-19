const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  };
};

export { asyncHandler };
