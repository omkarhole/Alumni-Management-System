const { User, Business, BusinessReview } = require('../models/Index');

// ==================== BUSINESS PROFILE CONTROLLERS ====================

// Register a new business
async function registerBusiness(req, res, next) {
  try {
    const userId = req.user.id;
    const businessData = req.body;

    // Check if user is an alumnus
    const user = await User.findById(userId);
    if (!user || user.type !== 'alumnus') {
      return res.status(403).json({ error: 'Only alumni can register businesses' });
    }

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ user: userId });
    if (existingBusiness) {
      return res.status(400).json({ error: 'You already have a registered business' });
    }

    const business = new Business({
      user: userId,
      ...businessData
    });

    await business.save();

    res.status(201).json({
      message: 'Business registered successfully',
      business
    });
  } catch (err) {
    next(err);
  }
}

// Get my business profile
async function getMyBusiness(req, res, next) {
  try {
    const userId = req.user.id;

    const business = await Business.findOne({ user: userId })
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch');

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json(business);
  } catch (err) {
    next(err);
  }
}

// Update my business profile
async function updateMyBusiness(req, res, next) {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const business = await Business.findOne({ user: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Don't allow changing user or creating duplicate
    delete updateData.user;
    
    // Check if trying to update to an existing business name
    if (updateData.businessName && updateData.businessName !== business.businessName) {
      const existingBusiness = await Business.findOne({ businessName: updateData.businessName });
      if (existingBusiness) {
        return res.status(400).json({ error: 'Business name already exists' });
      }
    }

    Object.assign(business, updateData);
    await business.save();

    res.json({
      message: 'Business updated successfully',
      business
    });
  } catch (err) {
    next(err);
  }
}

// Get business by ID
async function getBusinessById(req, res, next) {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId)
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch alumnus_bio.course');

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Increment view count
    business.totalViews += 1;
    await business.save();

    res.json(business);
  } catch (err) {
    next(err);
  }
}

// List all businesses with filters
async function listBusinesses(req, res, next) {
  try {
    const {
      category,
      city,
      country,
      search,
      hasDiscount,
      featured,
      page = 1,
      limit = 12,
      minRating = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by city
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by country
    if (country) {
      query['location.country'] = { $regex: country, $options: 'i' };
    }

    // Filter by alumni discount
    if (hasDiscount === 'true') {
      query.hasAlumniDiscount = true;
    }

    // Filter by featured
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Filter by minimum rating
    if (minRating > 0) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const businesses = await Business.find(query)
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Business.countDocuments(query);

    res.json({
      businesses,
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

// Get filter options
async function getBusinessFilterOptions(req, res, next) {
  try {
    const categories = await Business.distinct('category', { isActive: true });
    const cities = await Business.distinct('location.city', { isActive: true });
    const countries = await Business.distinct('location.country', { isActive: true });

    res.json({
      categories: categories.filter(c => c).sort(),
      cities: cities.filter(c => c).sort(),
      countries: countries.filter(c => c).sort()
    });
  } catch (err) {
    next(err);
  }
}

// Toggle business active status
async function toggleMyBusinessStatus(req, res, next) {
  try {
    const userId = req.user.id;

    const business = await Business.findOne({ user: userId });
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    business.isActive = !business.isActive;
    await business.save();

    res.json({
      message: `Business ${business.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: business.isActive
    });
  } catch (err) {
    next(err);
  }
}

// ==================== REVIEW CONTROLLERS ====================

// Add a review to a business
async function addReview(req, res, next) {
  try {
    const userId = req.user.id;
    const { businessId } = req.params;
    const { rating, title, comment } = req.body;

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if user already reviewed this business
    const existingReview = await BusinessReview.findOne({
      business: businessId,
      user: userId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this business' });
    }

    // Check if user is the business owner
    if (business.user.toString() === userId) {
      return res.status(400).json({ error: 'You cannot review your own business' });
    }

    const review = new BusinessReview({
      business: businessId,
      user: userId,
      rating,
      title,
      comment
    });

    await review.save();
    await review.populate('user', 'name email alumnus_bio.avatar');

    // Update business rating
    await updateBusinessRating(businessId);

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (err) {
    next(err);
  }
}

// Update my review
async function updateMyReview(req, res, next) {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await BusinessReview.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.rating = rating;
    if (title !== undefined) review.title = title;
    review.comment = comment;

    await review.save();

    // Update business rating
    await updateBusinessRating(review.business);

    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (err) {
    next(err);
  }
}

// Delete my review
async function deleteMyReview(req, res, next) {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await BusinessReview.findOne({
      _id: reviewId,
      user: userId
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const businessId = review.business;
    await review.deleteOne();

    // Update business rating
    await updateBusinessRating(businessId);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Get reviews for a business
async function getBusinessReviews(req, res, next) {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Check if business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await BusinessReview.find({
      business: businessId,
      isVisible: true
    })
      .populate('user', 'name email alumnus_bio.avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BusinessReview.countDocuments({
      business: businessId,
      isVisible: true
    });

    res.json({
      reviews,
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

// Mark review as helpful
async function markReviewHelpful(req, res, next) {
  try {
    const { reviewId } = req.params;

    const review = await BusinessReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.isHelpful += 1;
    await review.save();

    res.json({
      message: 'Review marked as helpful',
      isHelpful: review.isHelpful
    });
  } catch (err) {
    next(err);
  }
}

// Helper function to update business rating
async function updateBusinessRating(businessId) {
  const reviews = await BusinessReview.find({
    business: businessId,
    isVisible: true
  });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Business.findByIdAndUpdate(businessId, {
      rating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length
    });
  } else {
    await Business.findByIdAndUpdate(businessId, {
      rating: 0,
      totalReviews: 0
    });
  }
}

// ==================== ADMIN CONTROLLERS ====================

// Get all businesses (admin)
async function getAllBusinessesAdmin(req, res, next) {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const businesses = await Business.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Business.countDocuments(query);

    res.json({
      businesses,
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

// Get business statistics (admin)
async function getBusinessStats(req, res, next) {
  try {
    const totalBusinesses = await Business.countDocuments();
    const activeBusinesses = await Business.countDocuments({ isActive: true });
    const featuredBusinesses = await Business.countDocuments({ isFeatured: true });
    const businessesWithDiscount = await Business.countDocuments({ hasAlumniDiscount: true });
    
    const totalReviews = await BusinessReview.countDocuments();
    const visibleReviews = await BusinessReview.countDocuments({ isVisible: true });

    // Category breakdown
    const categoryBreakdown = await Business.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      businesses: {
        total: totalBusinesses,
        active: activeBusinesses,
        featured: featuredBusinesses,
        withDiscount: businessesWithDiscount
      },
      reviews: {
        total: totalReviews,
        visible: visibleReviews
      },
      categoryBreakdown
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Toggle business featured status
async function toggleFeaturedStatus(req, res, next) {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    business.isFeatured = !business.isFeatured;
    await business.save();

    res.json({
      message: `Business ${business.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      isFeatured: business.isFeatured
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Toggle business verification status
async function toggleVerificationStatus(req, res, next) {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    business.isVerified = !business.isVerified;
    await business.save();

    res.json({
      message: `Business ${business.isVerified ? 'verified' : 'unverified'} successfully`,
      isVerified: business.isVerified
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Toggle business active status
async function toggleBusinessActiveStatus(req, res, next) {
  try {
    const { businessId } = req.params;

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    business.isActive = !business.isActive;
    await business.save();

    res.json({
      message: `Business ${business.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: business.isActive
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Hide/show a review
async function toggleReviewVisibility(req, res, next) {
  try {
    const { reviewId } = req.params;

    const review = await BusinessReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.isVisible = !review.isVisible;
    await review.save();

    // Update business rating
    await updateBusinessRating(review.business);

    res.json({
      message: `Review ${review.isVisible ? 'visible' : 'hidden'} successfully`,
      isVisible: review.isVisible
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Business Profile
  registerBusiness,
  getMyBusiness,
  updateMyBusiness,
  getBusinessById,
  listBusinesses,
  getBusinessFilterOptions,
  toggleMyBusinessStatus,

  // Reviews
  addReview,
  updateMyReview,
  deleteMyReview,
  getBusinessReviews,
  markReviewHelpful,

  // Admin
  getAllBusinessesAdmin,
  getBusinessStats,
  toggleFeaturedStatus,
  toggleVerificationStatus,
  toggleBusinessActiveStatus,
  toggleReviewVisibility
};
