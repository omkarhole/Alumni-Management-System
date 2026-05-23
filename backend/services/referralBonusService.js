const { JobReferral } = require('../models/Index');

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getDeadlinePenaltyPercent(deadlineReductionPerDayPercent = 0, deadlineReductionCapPercent = 100, referenceDate, deadline) {
  if (!deadline || !referenceDate) {
    return 0;
  }

  const deadlineTime = new Date(deadline).getTime();
  const referenceTime = new Date(referenceDate).getTime();

  if (Number.isNaN(deadlineTime) || Number.isNaN(referenceTime) || referenceTime <= deadlineTime) {
    return 0;
  }

  const lateDays = Math.max(1, Math.ceil((referenceTime - deadlineTime) / (24 * 60 * 60 * 1000)));
  return Math.min(
    toNumber(deadlineReductionCapPercent, 100),
    lateDays * toNumber(deadlineReductionPerDayPercent, 0)
  );
}

function buildPolicySnapshot(referral) {
  return {
    payoutOn: referral.bonusPolicy?.payoutOn || 'filled',
    companyName: referral.bonusPolicy?.companyName || referral.company || '',
    companyMultiplier: toNumber(referral.bonusPolicy?.companyMultiplier, 1),
    companyFlatBonus: toNumber(referral.bonusPolicy?.companyFlatBonus, 0),
    deadlineReductionPerDayPercent: toNumber(referral.bonusPolicy?.deadlineReductionPerDayPercent, 0),
    deadlineReductionCapPercent: toNumber(referral.bonusPolicy?.deadlineReductionCapPercent, 100),
    enabled: referral.bonusPolicy?.enabled !== false,
    notes: referral.bonusPolicy?.notes || ''
  };
}

function normalizeApplicant(applicant) {
  if (!applicant) {
    return {
      applicantId: null,
      applicantName: ''
    };
  }

  const applicantUser = applicant.user;
  return {
    applicantId: applicantUser?._id || applicantUser || null,
    applicantName: applicantUser?.name || applicant.applicantName || applicant.name || ''
  };
}

async function resolveEligibleApplicant(referral, payoutEvent) {
  if (!referral?.applicants?.length) {
    return null;
  }

  if (payoutEvent === 'accepted') {
    const acceptedApplicant = referral.applicants.find((applicant) => applicant.status === 'accepted');
    return acceptedApplicant || null;
  }

  const acceptedApplicant = referral.applicants.find((applicant) => applicant.status === 'accepted');
  return acceptedApplicant || null;
}

async function computeReferralBonus(referralInput, options = {}) {
  const referral = referralInput?.populate ? referralInput : await JobReferral.findById(referralInput?._id || referralInput);

  if (!referral) {
    throw new Error('Referral not found');
  }

  const policy = buildPolicySnapshot(referral);
  const payoutEvent = policy.payoutOn || 'filled';
  const baseAmount = toNumber(referral.referralBonus, 0);

  const currentStatus = String(referral.status || 'open').toLowerCase();
  const payoutAchieved = payoutEvent === 'accepted'
    ? referral.applicants?.some((applicant) => applicant.status === 'accepted')
    : currentStatus === 'filled';

  const eligibleApplicant = await resolveEligibleApplicant(referral, payoutEvent);
  const eligibleApplicantStartAt = eligibleApplicant?.acceptedAt || (payoutEvent === 'filled' ? referral.filledAt : null);
  const normalizedApplicant = normalizeApplicant(eligibleApplicant);

  const response = {
    status: 'pending',
    amount: 0,
    baseAmount,
    multiplier: policy.companyMultiplier,
    flatBonus: policy.companyFlatBonus,
    deadlinePenaltyPercent: 0,
    deadlinePenaltyAmount: 0,
    payoutEvent,
    eligibleApplicantId: normalizedApplicant.applicantId,
    eligibleApplicantName: normalizedApplicant.applicantName,
    computedAt: new Date(),
    computedBy: options.computedBy || null,
    reason: '',
    policySnapshot: policy
  };

  if (!policy.enabled) {
    response.status = 'not-eligible';
    response.reason = 'Referral bonus policy is disabled';
    return response;
  }

  if (!payoutAchieved) {
    response.status = 'pending';
    response.reason = payoutEvent === 'accepted'
      ? 'Bonus becomes eligible when an applicant is accepted'
      : 'Bonus becomes eligible when the referral is filled';
    return response;
  }

  if (!eligibleApplicant) {
    response.status = 'not-eligible';
    response.reason = 'No accepted applicant was found';
    return response;
  }

  const deadlinePenaltyPercent = getDeadlinePenaltyPercent(
    policy.deadlineReductionPerDayPercent,
    policy.deadlineReductionCapPercent,
    eligibleApplicantStartAt,
    referral.deadline
  );

  const prePenaltyAmount = Math.max(
    0,
    Math.round((baseAmount * policy.companyMultiplier) + policy.companyFlatBonus)
  );
  const deadlinePenaltyAmount = Math.round(prePenaltyAmount * (deadlinePenaltyPercent / 100));
  const finalAmount = Math.max(0, prePenaltyAmount - deadlinePenaltyAmount);

  response.status = finalAmount > 0 ? 'eligible' : 'not-eligible';
  response.amount = finalAmount;
  response.deadlinePenaltyPercent = deadlinePenaltyPercent;
  response.deadlinePenaltyAmount = deadlinePenaltyAmount;
  response.reason = finalAmount > 0
    ? (deadlinePenaltyPercent > 0 ? 'Bonus reduced because the applicant started after the deadline' : 'Bonus eligible')
    : 'Bonus amount resolved to zero';
  response.eligibleApplicantId = normalizedApplicant.applicantId;
  response.eligibleApplicantName = normalizedApplicant.applicantName;

  return response;
}

async function persistReferralBonus(referral, computedBonus) {
  referral.bonusComputation = {
    ...referral.bonusComputation?.toObject?.() || referral.bonusComputation || {},
    ...computedBonus
  };

  await referral.save();
  return referral;
}

async function recomputeAndPersistReferralBonus(referral, options = {}) {
  const computedBonus = await computeReferralBonus(referral, options);
  const persistedReferral = await JobReferral.findById(referral._id);

  if (!persistedReferral) {
    throw new Error('Referral not found');
  }

  persistedReferral.bonusComputation = computedBonus;
  await persistedReferral.save();

  return {
    referral: persistedReferral,
    bonus: computedBonus
  };
}

module.exports = {
  computeReferralBonus,
  recomputeAndPersistReferralBonus
};