const test = require('node:test');
const assert = require('node:assert/strict');

const { acceptReferral } = require('../controllers/referral.controller');
const { JobReferral, User } = require('../models/Index');

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
    }
  };
}

test('acceptReferral keeps the referral open after accepting one applicant', async () => {
  const originalFindById = JobReferral.findById;
  const originalUserFindById = User.findById;

  const referral = {
    _id: 'referral-1',
    status: 'open',
    filledAt: null,
    postedBy: {
      toString: () => 'owner-1'
    },
    bonusPolicy: {
      payoutOn: 'accepted'
    },
    timeline: [],
    applicants: [
      {
        user: 'applicant-1',
        status: 'pending',
        acceptedAt: null,
        rejectedAt: null
      },
      {
        user: 'applicant-2',
        status: 'pending',
        acceptedAt: null,
        rejectedAt: null
      }
    ],
    save: async () => {},
    populate: async function populate() {
      return this;
    }
  };

  let referralFindByIdCalls = 0;

  JobReferral.findById = async (id) => {
    referralFindByIdCalls += 1;
    assert.equal(id, 'referral-1');
    return referral;
  };

  User.findById = (id) => {
    if (id === 'owner-1') {
      return {
        select: async () => ({ _id: 'owner-1', name: 'Owner User', type: 'alumnus' })
      };
    }

    if (id === 'applicant-1') {
      return {
        select: async () => ({ _id: 'applicant-1', name: 'Ada Lovelace' })
      };
    }

    throw new Error(`Unexpected user lookup: ${id}`);
  };

  try {
    const req = {
      params: { id: 'referral-1', applicantId: 'applicant-1' },
      user: { id: 'owner-1' }
    };
    const res = createResponse();

    await acceptReferral(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.deepStrictEqual(res.payload, {
      message: 'Applicant accepted successfully',
      referral
    });
    assert.equal(referral.status, 'open');
    assert.equal(referral.filledAt, null);
    assert.equal(referral.applicants[0].status, 'accepted');
    assert.ok(referral.applicants[0].acceptedAt instanceof Date);
    assert.equal(referral.applicants[1].status, 'pending');
    assert.deepStrictEqual(referral.timeline.map((event) => event.action), ['accepted']);
    assert.ok(referralFindByIdCalls >= 2);
  } finally {
    JobReferral.findById = originalFindById;
    User.findById = originalUserFindById;
  }
});