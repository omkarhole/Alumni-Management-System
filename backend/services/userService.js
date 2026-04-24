const bcrypt = require('bcrypt');
const { User } = require('../models/Index');
const { createCrudService } = require('./baseService');

const userCrud = createCrudService({
  model: User,
  resourceName: 'User',
  defaultPopulate: 'alumnus_bio.course',
  defaultSort: { name: 1 },
});

const listUsers = async () => userCrud.list();

const updateUser = async (id, payload) => {
  const updates = {
    name: payload.name,
    email: payload.email,
    type: payload.type,
  };

  if (payload.password) {
    updates.password = await bcrypt.hash(payload.password, 10);
  }

  return userCrud.update(id, updates);
};

const deleteUser = async (id) => userCrud.remove(id);

module.exports = {
  listUsers,
  updateUser,
  deleteUser,
  userCrud,
};