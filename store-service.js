const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    try {
      items = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'items.js'), 'utf8'));
      categories = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'categories.js'), 'utf8'));
      resolve();
    } catch (err) {
      reject("Unable to read data");
    }
  });
};

module.exports.getAllItems = function() {
  return new Promise((resolve, reject) => {
    if (items.length > 0) {
      resolve(items);
    } else {
      reject("No items available");
    }
  });
};

module.exports.getPublishedItems = function() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter(item => item.published);
    if (publishedItems.length > 0) {
      resolve(publishedItems);
    } else {
      reject("No published items available");
    }
  });
};

module.exports.getPublishedItemsByCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.published && item.category == categoryId);
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject("No items available for this category");
    }
  });
};

module.exports.getCategories = function() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject("No categories available");
    }
  });
};

module.exports.getItemsByCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category == categoryId);
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject("No items available for this category");
    }
  });
};

module.exports.getItemById = function(id) {
  return new Promise((resolve, reject) => {
    const item = items.find(item => item.id == id);
    if (item) {
      resolve(item);
    } else {
      reject("No item found with this ID");
    }
  });
};

module.exports.addItem = function(itemData) {
  return new Promise((resolve, reject) => {
    const newItem = {
      id: items.length + 1,
      ...itemData,
      published: false,
      postDate: new Date().toISOString().split('T')[0]
    };
    items.push(newItem);
    resolve();
  });
};