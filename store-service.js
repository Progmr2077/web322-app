const Sequelize = require('sequelize');
var sequelize = new Sequelize('JacobDB', 'JacobDB_owner', 'K82NuwEWrPBQ', {
  host: 'ep-long-voice-a5a719e9.us-east-2.aws.neon.tech',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false }
  },
  query: { raw: true }
});

const fs = require('fs');
const path = require('path');

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
    allowNull: false
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
Item.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject("Unable to sync the database");
      });
  });
};

module.exports.getAllItems = function() {
  return new Promise((resolve, reject) => {
    Item.findAll()
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getPublishedItems = function() {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { published: true }
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getPublishedItemsByCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        published: true,
        categoryId: categoryId
      }
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getCategories = function() {
  return new Promise((resolve, reject) => {
    Category.findAll()
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getItemsByCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { categoryId: categoryId }
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getItemsByMinDate = function(minDateStr) {
  const { gte } = Sequelize.Op;
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: {
        postDate: {
          [gte]: new Date(minDateStr)
        }
      }
    })
      .then(data => {
        resolve(data);
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.getItemById = function(id) {
  return new Promise((resolve, reject) => {
    Item.findAll({
      where: { id: id }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          reject("No results returned");
        }
      })
      .catch(err => {
        reject("No results returned");
      });
  });
};

module.exports.addItem = function(itemData) {
  return new Promise((resolve, reject) => {
    itemData.published = (itemData.published) ? true : false;

    for (let key in itemData) {
      if (itemData[key] === "") {
        itemData[key] = null;
      }
    }

    itemData.postDate = new Date();

    Item.create(itemData)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject("Unable to create item");
      });
  });
};

// Add a new category
module.exports.addCategory = function(categoryData) {
  return new Promise((resolve, reject) => {
    // Replace blank values with null
    for (let key in categoryData) {
      if (categoryData[key] === "") {
        categoryData[key] = null;
      }
    }

    // Create a new category
    Category.create(categoryData)
      .then(() => resolve())
      .catch(() => reject("unable to create category"));
  });
};

// Delete a category by ID
module.exports.deleteCategoryById = function(id) {
  return new Promise((resolve, reject) => {
    Category.destroy({ where: { id: id } })
      .then((result) => {
        if (result > 0) {
          resolve();
        } else {
          reject("Category not found or not deleted");
        }
      })
      .catch(() => reject("unable to delete category"));
  });
};

// Delete a post by ID
module.exports.deletePostById = function(id) {
  return new Promise((resolve, reject) => {
    Item.destroy({ where: { id: id } })
      .then((result) => {
        if (result > 0) {
          resolve();
        } else {
          reject("Post not found or not deleted");
        }
      })
      .catch(() => reject("unable to delete post"));
  });
};