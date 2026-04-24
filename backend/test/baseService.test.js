const test = require('node:test');
const assert = require('node:assert/strict');

const { createCrudService, stripIdFields, toErrorMessage } = require('../services/baseService');

const createQueryStub = (result) => {
  const query = {
    populateArg: null,
    sortArg: null,
    populate(arg) {
      this.populateArg = arg;
      return this;
    },
    sort(arg) {
      this.sortArg = arg;
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return query;
};

test('stripIdFields removes Mongo id fields from update payloads', () => {
  assert.deepStrictEqual(stripIdFields({ _id: '123', id: '123', name: 'Jane' }), {
    name: 'Jane',
  });
});

test('toErrorMessage maps duplicate key errors to a friendly AppError', () => {
  const error = new Error('duplicate');
  error.code = 11000;
  error.keyValue = { email: 'test@example.com' };

  const mapped = toErrorMessage(error, 'User');

  assert.equal(mapped.name, 'AppError');
  assert.equal(mapped.statusCode, 400);
  assert.equal(mapped.message, 'email already exists');
});

test('createCrudService list executes query options and returns data', async () => {
  const query = createQueryStub([{ _id: '1', name: 'Alpha' }]);
  const model = {
    find: () => query,
  };

  const service = createCrudService({
    model,
    resourceName: 'Item',
    defaultPopulate: { path: 'owner' },
    defaultSort: { createdAt: -1 },
  });

  const result = await service.list();

  assert.deepStrictEqual(result, [{ _id: '1', name: 'Alpha' }]);
  assert.deepStrictEqual(query.populateArg, { path: 'owner' });
  assert.deepStrictEqual(query.sortArg, { createdAt: -1 });
});

test('createCrudService update strips id fields before updating', async () => {
  let capturedArgs = null;
  const model = {
    findByIdAndUpdate: (id, updates, options) => {
      capturedArgs = { id, updates, options };
      return createQueryStub({ _id: id, ...updates });
    },
  };

  const service = createCrudService({
    model,
    resourceName: 'Item',
  });

  const result = await service.update('abc', { _id: 'abc', id: 'abc', name: 'Updated' });

  assert.deepStrictEqual(capturedArgs, {
    id: 'abc',
    updates: { name: 'Updated' },
    options: { new: true },
  });
  assert.equal(result._id, 'abc');
  assert.equal(result.name, 'Updated');
});

test('createCrudService create maps duplicate key errors', async () => {
  const error = new Error('duplicate');
  error.code = 11000;
  error.keyValue = { slug: 'sample' };

  const model = {
    create: async () => {
      throw error;
    },
  };

  const service = createCrudService({
    model,
    resourceName: 'Item',
  });

  await assert.rejects(
    () => service.create({ slug: 'sample' }),
    (mappedError) => mappedError.name === 'AppError' && mappedError.message === 'slug already exists',
  );
});

test('createCrudService remove throws not found errors', async () => {
  const model = {
    findByIdAndDelete: async () => null,
  };

  const service = createCrudService({
    model,
    resourceName: 'Item',
  });

  await assert.rejects(
    () => service.remove('missing'),
    (error) => error.name === 'AppError' && error.statusCode === 404 && error.message === 'Item not found',
  );
});