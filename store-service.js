// store-service.js
const Category = require('./models/category');
const Publication = require('./models/publication');

// Initialize the database (Mongoose handles connections automatically)
module.exports.initialize = async function() {
  try {
    // Mongoose handles connection on its own; no need to explicitly sync
    console.log('MongoDB connected');
  } catch (err) {
    throw new Error("Unable to connect to the database: " + err.message);
  }
};

// Get all publications
module.exports.getAllPublications = async function() {
  try {
    return await Publication.find().populate('categoryId');
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get published publications
module.exports.getPublishedPublications = async function() {
  try {
    return await Publication.find({ published: true }).populate('categoryId');
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get published publications by category
module.exports.getPublishedPublicationsByCategory = async function(categoryId) {
  try {
    return await Publication.find({
      published: true,
      categoryId: categoryId
    }).populate('categoryId');
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get all categories
module.exports.getCategories = async function() {
  try {
    return await Category.find();
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get publications by category
module.exports.getPublicationsByCategory = async function(categoryId) {
  try {
    return await Publication.find({ categoryId: categoryId }).populate('categoryId');
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get publications by minimum date
module.exports.getPublicationsByMinDate = async function(minDateStr) {
  try {
    return await Publication.find({
      postDate: { $gte: new Date(minDateStr) }
    }).populate('categoryId');
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get publication by ID
module.exports.getPublicationById = async function(id) {
  try {
    const publication = await Publication.findById(id).populate('categoryId');
    if (publication) {
      return publication;
    } else {
      throw new Error("Publication not found");
    }
  } catch (err) {
    throw new Error("Error fetching publication: " + err.message);
  }
};

// Add a new publication
module.exports.addPublication = async function(publicationData) {
  publicationData.published = Boolean(publicationData.published);

  // Handle empty string fields
  for (let key in publicationData) {
    if (publicationData[key] === "") {
      publicationData[key] = null;
    }
  }

  try {
    await Publication.create(publicationData);
  } catch (err) {
    throw new Error("Unable to create publication: " + err.message);
  }
};

// Add a new category
module.exports.addCategory = async function(categoryData) {
  for (let key in categoryData) {
    if (categoryData[key] === "") {
      categoryData[key] = null;
    }
  }

  try {
    await Category.create(categoryData);
  } catch (err) {
    throw new Error("Unable to create category: " + err.message);
  }
};

// Delete a category by ID
module.exports.deleteCategoryById = async function(id) {
  try {
    const result = await Category.deleteOne({ _id: id });
    if (result.deletedCount > 0) {
      return;
    } else {
      throw new Error("Category not found or not deleted");
    }
  } catch (err) {
    throw new Error("Unable to delete category: " + err.message);
  }
};

// Delete a publication by ID
module.exports.deletePublicationById = async function(id) {
  try {
    const result = await Publication.deleteOne({ _id: id });
    if (result.deletedCount > 0) {
      return;
    } else {
      throw new Error("Publication not found or not deleted");
    }
  } catch (err) {
    throw new Error("Unable to delete publication: " + err.message);
  }
};