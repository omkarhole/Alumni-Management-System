const { Donation, DonationCampaign, User, Badge, UserBadge } = require('../models/Index');
const { uploadImage, deleteImage } = require('../utils/image-storage');

/**
 * ==================== DONATION CAMPAIGN OPERATIONS ====================
 */

// Get all campaigns with filters
async function getCampaigns(req, res, next) {
  try {
    const {
      status = 'active',
      category,
      featured,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const campaigns = await DonationCampaign.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DonationCampaign.countDocuments(query);

    res.json({
      campaigns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get single campaign with donation stats
async function getCampaignDetails(req, res, next) {
  try {
    const { campaignId } = req.params;

    const campaign = await DonationCampaign.findOne({
      $or: [
        { _id: campaignId },
        { slug: campaignId }
      ]
    }).populate('createdBy', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get donation statistics
    const donations = await Donation.find({
      campaign: campaign._id,
      paymentStatus: 'completed'
    }).select('amount donor donorName isAnonymous displayName');

    const recentDonations = donations
      .slice(-10)
      .reverse();

    const percentComplete = campaign.targetAmount > 0
      ? Math.round((campaign.currentAmount / campaign.targetAmount) * 100)
      : 0;

    res.json({
      campaign: {
        ...campaign.toObject(),
        percentComplete,
        stats: {
          totalDonations: donations.length,
          totalAmount: campaign.currentAmount,
          averageDonation: donations.length > 0
            ? Math.round(campaign.currentAmount / donations.length * 100) / 100
            : 0
        },
        recentDonations: campaign.displayDonors
          ? recentDonations.map(d => ({
              name: d.isAnonymous ? 'Anonymous' : (d.displayName || d.donorName),
              amount: d.amount
            }))
          : []
      }
    });
  } catch (err) {
    next(err);
  }
}

// Create campaign (admin only)
async function createCampaign(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      detailedDescription,
      category,
      targetAmount,
      currency = 'USD',
      endDate,
      beneficiary,
      allowAnonymous = true,
      displayDonors = true,
      taxDeductible = true,
      taxId
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !targetAmount) {
      return res.status(400).json({
        message: 'Title, description, category, and target amount are required'
      });
    }

    // Upload image if provided
    let imageData = {};
    if (req.file) {
      imageData = await uploadImage(req.file, {
        folder: 'campaigns',
        prefix: 'campaign'
      });
    }

    const campaign = new DonationCampaign({
      title,
      description,
      detailedDescription,
      category,
      targetAmount,
      currency,
      endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      beneficiary,
      allowAnonymous,
      displayDonors,
      taxDeductible,
      taxId,
      createdBy: userId,
      image: imageData.path || '',
      image_public_id: imageData.publicId || ''
    });

    await campaign.save();
    await campaign.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign
    });
  } catch (err) {
    next(err);
  }
}

// Update campaign
async function updateCampaign(req, res, next) {
  try {
    const { campaignId } = req.params;
    const userId = req.user.id;

    const campaign = await DonationCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Only creator or admin can update
    if (campaign.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this campaign' });
    }

    const {
      title,
      description,
      detailedDescription,
      targetAmount,
      endDate,
      status,
      beneficiary,
      displayDonors,
      priceTiers
    } = req.body;

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (detailedDescription) campaign.detailedDescription = detailedDescription;
    if (targetAmount) campaign.targetAmount = targetAmount;
    if (endDate) campaign.endDate = endDate;
    if (status) campaign.status = status;
    if (beneficiary !== undefined) campaign.beneficiary = beneficiary;
    if (displayDonors !== undefined) campaign.displayDonors = displayDonors;
    if (priceTiers) campaign.priceTiers = priceTiers;

    // Update image if new one provided
    if (req.file) {
      if (campaign.image) {
        try {
          await deleteImage(campaign.image, campaign.image_public_id);
        } catch (err) {
          console.error('Error deleting old image:', err.message);
        }
      }

      const imageData = await uploadImage(req.file, {
        folder: 'campaigns',
        prefix: 'campaign'
      });
      campaign.image = imageData.path;
      campaign.image_public_id = imageData.publicId || '';
    }

    await campaign.save();
    await campaign.populate('createdBy', 'name email');

    res.json({
      message: 'Campaign updated successfully',
      campaign
    });
  } catch (err) {
    next(err);
  }
}

// Add campaign update/milestone
async function addCampaignUpdate(req, res, next) {
  try {
    const { campaignId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const campaign = await DonationCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    campaign.updates.push({
      title,
      content,
      date: new Date()
    });

    await campaign.save();

    res.json({
      message: 'Update added successfully',
      campaign
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ==================== DONATION OPERATIONS ====================
 */

// Get all donations (with filters)
async function getDonations(req, res, next) {
  try {
    const {
      campaign,
      paymentStatus = 'completed',
      page = 1,
      limit = 20,
      sort = '-donatedAt'
    } = req.query;

    const query = {};
    if (campaign) query.campaign = campaign;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const donations = await Donation.find(query)
      .populate('donor', 'name email')
      .populate('campaign', 'title')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);

    res.json({
      donations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get donor's donation history
async function getDonorHistory(req, res, next) {
  try {
    const userId = req.user.id;

    const donations = await Donation.find({
      $or: [
        { donor: userId },
        { donorEmail: req.user.email }
      ],
      paymentStatus: 'completed'
    })
      .populate('campaign', 'title image slug')
      .sort('-donatedAt');

    const stats = {
      totalDonated: 0,
      donationCount: donations.length,
      campaignCount: new Set(),
      averageDonation: 0
    };

    donations.forEach(d => {
      stats.totalDonated += d.amount;
      stats.campaignCount.add(d.campaign._id.toString());
    });

    stats.campaignCount = stats.campaignCount.size;
    stats.averageDonation = donations.length > 0
      ? Math.round(stats.totalDonated / donations.length * 100) / 100
      : 0;

    res.json({
      donations,
      stats
    });
  } catch (err) {
    next(err);
  }
}

// Create donation intent (for Stripe)
async function createDonationIntent(req, res, next) {
  try {
    const { campaignId, amount, email, name, isAnonymous = false, message = '', paymentMethod = 'stripe' } = req.body;

    if (!campaignId || !amount || !email || !name) {
      return res.status(400).json({
        message: 'Campaign ID, amount, email, and name are required'
      });
    }

    const campaign = await DonationCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Create donation record
    const donation = new Donation({
      donor: req.user?.id || null,
      campaign: campaignId,
      amount,
      currency: campaign.currency,
      paymentMethod,
      donorEmail: email,
      donorName: name,
      isAnonymous,
      message,
      paymentStatus: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        source: req.body.source || 'website'
      }
    });

    await donation.save();

    // For Stripe, would normally integrate Stripe SDK here
    // This is a simplified example - see donation.routes.js for webhook setup
    res.json({
      success: true,
      donationId: donation._id,
      message: 'Donation created, proceed to payment'
    });
  } catch (err) {
    next(err);
  }
}

// Complete donation (called after successful payment)
async function completeDonation(req, res, next) {
  try {
    const { donationId } = req.params;
    const { transactionId, chargeId, method = 'stripe' } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Mark as completed
    donation.paymentStatus = 'completed';
    donation.completedAt = new Date();

    if (method === 'stripe' && chargeId) {
      donation.stripeChargeId = chargeId;
    } else if (method === 'paypal' && transactionId) {
      donation.paypalTransactionId = transactionId;
    }

    await donation.save();

    // Update campaign
    const campaign = await DonationCampaign.findById(donation.campaign);
    campaign.currentAmount += donation.amount;
    campaign.donorCount += 1;
    await campaign.save();

    // Award badge if eligible
    if (donation.donor) {
      await awardDonorBadge(donation.donor, donation.amount);
    }

    // Generate tax receipt if applicable
    if (campaign.taxDeductible) {
      // Tax receipt generation would happen here
      donation.receiptGenerated = true;
    }

    res.json({
      message: 'Donation completed successfully',
      donation
    });
  } catch (err) {
    next(err);
  }
}

/**
 * ==================== BADGE & RECOGNITION ====================
 */

// Award donor badges based on amount
async function awardDonorBadge(userId, amount) {
  try {
    let badgeNames = [];
    
    if (amount >= 10000) badgeNames.push('Platinum Donor');
    else if (amount >= 5000) badgeNames.push('Gold Donor');
    else if (amount >= 1000) badgeNames.push('Silver Donor');
    else if (amount >= 100) badgeNames.push('Bronze Donor');

    for (const badgeName of badgeNames) {
      const badge = await Badge.findOne({ name: badgeName, category: 'donation' });
      if (badge) {
        // Check if user already has this badge
        const existing = await UserBadge.findOne({ user: userId, badge: badge._id });
        if (!existing) {
          const userBadge = new UserBadge({
            user: userId,
            badge: badge._id,
            source: {
              type: 'donation',
              referenceId: null
            }
          });
          await userBadge.save();
        }
      }
    }
  } catch (err) {
    console.error('Error awarding badge:', err.message);
  }
}

// Get donor badges
async function getDonorBadges(req, res, next) {
  try {
    const userId = req.user.id;

    const badges = await UserBadge.find({
      user: userId,
      'source.type': 'donation'
    })
      .populate('badge', 'name description icon color');

    res.json({ badges });
  } catch (err) {
    next(err);
  }
}

/**
 * ==================== STATISTICS ====================
 */

// Get donation statistics
async function getDonationStats(req, res, next) {
  try {
    const { period = 'month' } = req.query;

    let startDate = new Date();
    if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
    else if (period === 'quarter') startDate.setMonth(startDate.getMonth() - 3);
    else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);

    const donations = await Donation.find({
      paymentStatus: 'completed',
      completedAt: { $gte: startDate }
    });

    const campaigns = await DonationCampaign.find({
      status: { $in: ['active', 'completed'] }
    });

    const stats = {
      totalDonations: donations.length,
      totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: donations.length > 0
        ? Math.round(donations.reduce((sum, d) => sum + d.amount, 0) / donations.length * 100) / 100
        : 0,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalCampaignTarget: campaigns.reduce((sum, c) => sum + c.targetAmount, 0),
      totalRaised: campaigns.reduce((sum, c) => sum + c.currentAmount, 0),
      completedCampaigns: campaigns.filter(c => c.status === 'completed').length
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

// Export functions
module.exports = {
  getCampaigns,
  getCampaignDetails,
  createCampaign,
  updateCampaign,
  addCampaignUpdate,
  getDonations,
  getDonorHistory,
  createDonationIntent,
  completeDonation,
  awardDonorBadge,
  getDonorBadges,
  getDonationStats
};
