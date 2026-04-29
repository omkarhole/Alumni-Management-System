const test = require('node:test');
const assert = require('node:assert/strict');

const { User } = require('../models/Index');
const { updateAccount } = require('../controllers/alumni.controller');

function createResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

test('updateAccount rejects attempts to update a different user account', async () => {
  const originalFindById = User.findById;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;

  let findByIdCalled = false;
  User.findById = () => {
    findByIdCalled = true;
    throw new Error('findById should not be called for forbidden requests');
  };
  User.findByIdAndUpdate = () => {
    throw new Error('findByIdAndUpdate should not be called for forbidden requests');
  };

  try {
    const req = {
      user: { id: 'user-1' },
      body: { user_id: 'user-2' },
    };
    const res = createResponse();
    let nextCalled = false;

    await updateAccount(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 403);
    assert.deepStrictEqual(res.payload, { message: 'You can only update your own account' });
    assert.equal(findByIdCalled, false);
    assert.equal(nextCalled, false);
  } finally {
    User.findById = originalFindById;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});

test('updateAccount uses the authenticated user id without requiring body user_id', async () => {
  const originalFindById = User.findById;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;

  let lookedUpUserId = null;
  let updatedUserId = null;
  let updatePayload = null;

  User.findById = (userId) => {
    lookedUpUserId = userId;
    return {
      select: async () => ({
        alumnus_bio: {
          avatar: 'public/avatars/old.png',
          avatar_public_id: 'old-avatar-id',
        },
      }),
    };
  };

  User.findByIdAndUpdate = async (userId, payload) => {
    updatedUserId = userId;
    updatePayload = payload;
  };

  try {
    const req = {
      user: { id: 'user-1' },
      body: {
        name: 'Updated Name',
        email: 'updated@example.com',
        gender: 'Female',
        batch: '2024',
        course_id: 'course-1',
        connected_to: 'Mentors',
        password: 'new-password',
      },
    };
    const res = createResponse();

    await updateAccount(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepStrictEqual(res.payload, { message: 'Account updated successfully' });
    assert.equal(lookedUpUserId, 'user-1');
    assert.equal(updatedUserId, 'user-1');
    assert.equal(updatePayload.name, 'Updated Name');
    assert.equal(updatePayload.email, 'updated@example.com');
    assert.equal(updatePayload['alumnus_bio.gender'], 'Female');
    assert.equal(updatePayload['alumnus_bio.batch'], '2024');
    assert.equal(updatePayload['alumnus_bio.course'], 'course-1');
    assert.equal(updatePayload['alumnus_bio.connected_to'], 'Mentors');
    assert.equal(updatePayload.password.startsWith('$2'), true);
  } finally {
    User.findById = originalFindById;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  }
});