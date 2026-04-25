const AppError = require('../utils/AppError');

const toErrorMessage = (error, resourceName) => {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyValue || error.keyPattern || {})[0];
    return new AppError(`${field || resourceName.toLowerCase()} already exists`, 400);
  }

  return error;
};

const stripIdFields = (payload = {}) => {
  const sanitized = { ...payload };
  delete sanitized._id;
  delete sanitized.id;
  return sanitized;
};

const createCrudService = ({
  model,
  resourceName,
  defaultPopulate = null,
  defaultSort = null,
}) => {
  const applyQueryOptions = (query, { populate = defaultPopulate, sort = defaultSort } = {}) => {
    let result = query;

    if (populate) {
      result = result.populate(populate);
    }

    if (sort) {
      result = result.sort(sort);
    }

    return result;
  };

  const list = async ({ filter = {}, populate, sort } = {}) => {
    return await applyQueryOptions(model.find(filter), { populate, sort });
  };

  const findById = async (id, { populate } = {}) => {
    const record = await applyQueryOptions(model.findById(id), { populate });

    if (!record) {
      throw AppError.notFound(resourceName);
    }

    return record;
  };

  const create = async (payload, { populate } = {}) => {
    try {
      const record = await model.create(payload);

      if (populate) {
        await record.populate(populate);
      }

      return record;
    } catch (error) {
      throw toErrorMessage(error, resourceName);
    }
  };

  const update = async (id, payload, { populate, options = { new: true } } = {}) => {
    try {
      const updates = stripIdFields(payload);
      const record = await model.findByIdAndUpdate(id, updates, options);

      if (!record) {
        throw AppError.notFound(resourceName);
      }

      if (populate) {
        await record.populate(populate);
      }

      return record;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw toErrorMessage(error, resourceName);
    }
  };

  const remove = async (id) => {
    try {
      const record = await model.findByIdAndDelete(id);

      if (!record) {
        throw AppError.notFound(resourceName);
      }

      return record;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw toErrorMessage(error, resourceName);
    }
  };

  return {
    list,
    findById,
    create,
    update,
    remove,
    stripIdFields,
    toErrorMessage,
  };
};

module.exports = {
  createCrudService,
  stripIdFields,
  toErrorMessage,
};