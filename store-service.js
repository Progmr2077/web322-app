const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

// Set up Sequelize connection
const sequelize = new Sequelize('JacobDB', 'JacobDB_owner', 'K82NuwEWrPBQ', {
  host: 'ep-long-voice-a5a719e9.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

// Define the Item model
const Item = sequelize.define('Item', {
  body: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  postDate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW // Default to current time if not provided
  },
  featureImage: {
    type: Sequelize.STRING,
    allowNull: true
  },
  published: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false
  }
});

// Define the Category model
const Category = sequelize.define('Category', {
  category: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Define the relationship between Item and Category
Item.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Initialize the database
module.exports.initialize = async function() {
  try {
    await sequelize.sync();
  } catch (err) {
    throw new Error("Unable to sync the database: " + err.message);
  }
};

// Get all items
module.exports.getAllItems = async function() {
  try {
    return await Item.findAll();
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get published items
module.exports.getPublishedItems = async function() {
  try {
    return await Item.findAll({
      where: { published: true }
    });
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get published items by category
module.exports.getPublishedItemsByCategory = async function(categoryId) {
  try {
    return await Item.findAll({
      where: {
        published: true,
        categoryId: categoryId
      }
    });
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get all categories
module.exports.getCategories = async function() {
  try {
    return await Category.findAll();
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get items by category
module.exports.getItemsByCategory = async function(categoryId) {
  try {
    return await Item.findAll({
      where: { categoryId: categoryId }
    });
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get items by minimum date
module.exports.getItemsByMinDate = async function(minDateStr) {
  const { Op } = Sequelize;
  try {
    return await Item.findAll({
      where: {
        postDate: {
          [Op.gte]: new Date(minDateStr)
        }
      }
    });
  } catch (err) {
    throw new Error("No results returned: " + err.message);
  }
};

// Get item by ID
module.exports.getItemById = async function(id) {
  try {
    const item = await Item.findByPk(id);
    if (item) {
      return item;
    } else {
      throw new Error("Item not found");
    }
  } catch (err) {
    throw new Error("Error fetching item: " + err.message);
  }
};

// Add a new item
module.exports.addItem = async function(itemData) {
  itemData.published = Boolean(itemData.published);
  
  // Handle empty string fields
  for (let key in itemData) {
    if (itemData[key] === "") {
      itemData[key] = null;
    }
  }

  // Set postDate to current date if not provided
  if (!itemData.postDate) {
    itemData.postDate = new Date();
  }

  try {
    await Item.create(itemData);
  } catch (err) {
    throw new Error("Unable to create item: " + err.message);
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
    const result = await Category.destroy({ where: { id: id } });
    if (result > 0) {
      return;
    } else {
      throw new Error("Category not found or not deleted");
    }
  } catch (err) {
    throw new Error("Unable to delete category: " + err.message);
  }
};

// Delete a post by ID
module.exports.deletePostById = async function(id) {
  try {
    const result = await Item.destroy({ where: { id: id } });
    if (result > 0) {
      return;
    } else {
      throw new Error("Post not found or not deleted");
    }
  } catch (err) {
    throw new Error("Unable to delete post: " + err.message);
  }
};