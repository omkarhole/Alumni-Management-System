const { User, Marketplace } = require('../models/Index');

// ==================== MARKETPLACE CONTROLLERS ====================

// Create a new marketplace listing
async function createListing(req, res, next) {
  try {
    const userId = req.user.id;
    const { title, category, description, price, priceType, contactEmail, location, phoneNumber, tags, images } = req.body;

    // Validate category
    const validCategories = ['Jobs', 'Services', 'Items', 'Space', 'Networking'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const listing = new Marketplace({
      title,
      category,
      description,
      price: price || 0,
      priceType: priceType || 'Fixed',
      contactEmail: contactEmail || req.user.email,
      location,
      phoneNumber,
      tags: tags || [],
      images: images || [],
      user: userId,
      status: 'Active'
    });

    await listing.save();
    await listing.populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch');

    res.status(201).json({
      message: 'Listing created successfully',
      listing
    });
  } catch (err) {
    next(err);
  }
}

// Get all marketplace listings with filters and search
async function getAllListings(req, res, next) {
  try {
    const { category, status, search, priceMin, priceMax, sortBy = 'recent', page = 1, limit = 12 } = req.query;
    
    const filter = { status: 'Active' };

    // Apply category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Apply price range filter
    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = parseFloat(priceMin);
      if (priceMax) filter.price.$lte = parseFloat(priceMax);
    }

    // Apply search
    if (search) {
      filter.$text = { $search: search };
    }

    // Determine sort order
    let sortOrder = { createdAt: -1 }; // default: recent
    if (sortBy === 'price-low') sortOrder = { price: 1 };
    if (sortBy === 'price-high') sortOrder = { price: -1 };
    if (sortBy === 'popular') sortOrder = { views: -1 };
    if (sortBy === 'trending') sortOrder = { featured: -1, likes: -1 };

    const skip = (page - 1) * limit;

    const listings = await Marketplace.find(filter)
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch')
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Marketplace.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        pageSize: parseInt(limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get single marketplace listing
async function getListingById(req, res, next) {
  try {
    const { listingId } = req.params;

    const listing = await Marketplace.findById(listingId)
      .populate('user', 'name email alumnus_bio.avatar alumnus_bio.batch alumnus_bio.course');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment views
    await listing.incrementViews();

    res.json(listing);
  } catch (err) {
    next(err);
  }
}

// Get my listings
async function getMyListings(req, res, next) {
  try {
    const userId = req.user.id;
    const { status = 'All' } = req.query;

    const filter = { user: userId };
    if (status !== 'All') {
      filter.status = status;
    }

    const listings = await Marketplace.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email alumnus_bio.avatar');

    res.json(listings);
  } catch (err) {
    next(err);
  }
}

// Update marketplace listing
async function updateListing(req, res, next) {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this listing' });
    }

    // Validate category if being updated
    if (updateData.category) {
      const validCategories = ['Jobs', 'Services', 'Items', 'Space', 'Networking'];
      if (!validCategories.includes(updateData.category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    Object.assign(listing, updateData);
    await listing.save();
    await listing.populate('user', 'name email alumnus_bio.avatar');

    res.json({
      message: 'Listing updated successfully',
      listing
    });
  } catch (err) {
    next(err);
  }
}

// Delete marketplace listing
async function deleteListing(req, res, next) {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this listing' });
    }

    await Marketplace.findByIdAndDelete(listingId);

    res.json({
      message: 'Listing deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Update listing status
async function updateListingStatus(req, res, next) {
  try {
    const { listingId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['Active', 'Inactive', 'Sold', 'Archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.user.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized to update this listing' });
    }

    listing.status = status;
    await listing.save();

    res.json({
      message: 'Listing status updated successfully',
      listing
    });
  } catch (err) {
    next(err);
  }
}

// Toggle like on listing
async function toggleLike(req, res, next) {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await listing.toggleLike(userId);

    res.json({
      message: 'Like toggled successfully',
      likes: listing.likes.length,
      isLiked: listing.likes.includes(userId)
    });
  } catch (err) {
    next(err);
  }
}

// Get category options
async function getCategoryOptions(req, res, next) {
  try {
    const categories = ['Jobs', 'Services', 'Items', 'Space', 'Networking'];
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => ({
        name: category,
        count: await Marketplace.countDocuments({ category, status: 'Active' })
      }))
    );

    res.json(categoryStats);
  } catch (err) {
    next(err);
  }
}

// Get marketplace stats
async function getMarketplaceStats(req, res, next) {
  try {
    const totalListings = await Marketplace.countDocuments();
    const activeListings = await Marketplace.countDocuments({ status: 'Active' });
    const categories = await Marketplace.distinct('category', { status: 'Active' });

    const categoryBreakdown = {};
    for (const category of categories) {
      categoryBreakdown[category] = await Marketplace.countDocuments({ category, status: 'Active' });
    }

    res.json({
      total: totalListings,
      active: activeListings,
      categories: categoryBreakdown
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Get all listings
async function getAllListingsAdmin(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const listings = await Marketplace.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Marketplace.countDocuments(filter);

    res.json({
      listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Toggle featured status
async function toggleFeaturedStatus(req, res, next) {
  try {
    const { listingId } = req.params;

    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.featured = !listing.featured;
    await listing.save();

    res.json({
      message: 'Featured status updated',
      listing
    });
  } catch (err) {
    next(err);
  }
}

// Admin: Toggle verification status
async function toggleVerificationStatus(req, res, next) {
  try {
    const { listingId } = req.params;

    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.verified = !listing.verified;
    await listing.save();

    res.json({
      message: 'Verification status updated',
      listing
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  getMyListings,
  updateListing,
  deleteListing,
  updateListingStatus,
  toggleLike,
  getCategoryOptions,
  getMarketplaceStats,
  getAllListingsAdmin,
  toggleFeaturedStatus,
  toggleVerificationStatus
};
