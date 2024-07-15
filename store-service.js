const fs = require('fs');

let items = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/items.js', 'utf8', (err, data) => { 
      if (err) {
        reject('Unable to read items file');
      } else {
        items = JSON.parse(data);
        fs.readFile('./data/categories.js', 'utf8', (err, data) => { 
          if (err) {
            reject('Unable to read categories file');
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
}

function getAllItems() {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      reject('No items found');
    } else {
      resolve(items);
    }
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published === true);
    if (publishedItems.length === 0) {
      reject('No published items found');
    } else {
      resolve(publishedItems);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject('No categories found');
    } else {
      resolve(categories);
    }
  });
}

function addItem(itemData) {
  return new Promise((resolve, reject) => {
    if (!itemData) {
      reject('No item data provided');
    } else {
      itemData.published = itemData.published ? true : false;

      // Ensure unique ID generation (example: using the current timestamp)
      itemData.id = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;

      items.push(itemData);
      resolve(itemData);
    }
  });
}

function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category === parseInt(category));
    if (filteredItems.length === 0) {
      reject('No items found for this category');
    } else {
      resolve(filteredItems);
    }
  });
}

function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);
    const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
    if (filteredItems.length === 0) {
      reject('No items found after this date');
    } else {
      resolve(filteredItems);
    }
  });
}

function getItemById(id) {
  return new Promise((resolve, reject) => {
    const item = items.find(item => item.id === parseInt(id));
    if (!item) {
      reject('No item found with this ID');
    } else {
      resolve(item);
    }
  });
}

module.exports.getPublishedItemsByCategory = function(category) {
  return new Promise((resolve, reject) => {
    let filteredItems = items.filter(item => item.published && item.category === category);
    if (filteredItems.length > 0) {
      resolve(filteredItems);
    } else {
      reject("no results");
    }
  });
};

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById
};