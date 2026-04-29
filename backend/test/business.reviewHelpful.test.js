const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cookieParser = require('cookie-parser');

const businessRoutes = require('../routes/business.routes');
const BusinessReview = require('../models/BusinessReview.model');
const { markReviewHelpful } = require('../controllers/business.controller');

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

test('PATCH /reviews/:reviewId/helpful rejects unauthenticated requests with 401', async (t) => {
  const app = express();
  app.use(cookieParser());
  app.use('/api/business', businessRoutes);

  const server = app.listen(0);
  t.after(() => server.close());

  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/business/reviews/507f1f77bcf86cd799439011/helpful`, {
    method: 'PATCH',
  });

  assert.equal(response.status, 401);
  assert.deepStrictEqual(await response.json(), { error: 'Unauthorized' });
});

test('markReviewHelpful blocks duplicate votes from the same user', async () => {
  const originalFindById = BusinessReview.findById;

  const savedReview = {
    isHelpful: 3,
    helpfulBy: ['user-1'],
    save: async () => {},
  };

  BusinessReview.findById = async () => savedReview;

  try {
    const req = {
      params: { reviewId: 'review-1' },
      user: { id: 'user-1' },
    };
    const res = createResponse();

    await markReviewHelpful(req, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.deepStrictEqual(res.payload, { error: 'You already marked this review as helpful' });
    assert.equal(savedReview.isHelpful, 3);
    assert.deepStrictEqual(savedReview.helpfulBy, ['user-1']);
  } finally {
    BusinessReview.findById = originalFindById;
  }
});

test('markReviewHelpful counts a unique helpful vote once', async () => {
  const originalFindById = BusinessReview.findById;

  const savedReview = {
    isHelpful: 3,
    helpfulBy: ['user-1'],
    save: async () => {},
  };

  BusinessReview.findById = async () => savedReview;

  try {
    const req = {
      params: { reviewId: 'review-1' },
      user: { id: 'user-2' },
    };
    const res = createResponse();

    await markReviewHelpful(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepStrictEqual(res.payload, {
      message: 'Review marked as helpful',
      isHelpful: 4,
    });
    assert.equal(savedReview.isHelpful, 4);
    assert.deepStrictEqual(savedReview.helpfulBy, ['user-1', 'user-2']);
  } finally {
    BusinessReview.findById = originalFindById;
  }
});