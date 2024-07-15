const fs = require('fs');

let items = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/items.js', 'utf8', (err, data) => {
      if (err) {
        reject('unable to read file');
      } else {
        items = JSON.parse(data);
        fs.readFile('./data/categories.js', 'utf8', (err, data) => {
          if (err) {
            reject('unable to read file');
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
      reject('no results returned');
    } else {
      resolve(items);
    }
  });
}

function getPublishedItems() {
  return new Promise((resolve, reject) => {
    const publishedItems = items.filter((item) => item.published === true);
    if (publishedItems.length === 0) {
      reject('no results returned');
    } else {
      resolve(publishedItems);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length === 0) {
      reject('no results returned');
    } else {
      resolve(categories);
    }
  });
}

// Add the addItem function
function addItem(itemData) {
  return new Promise((resolve, reject) => {
    if (!itemData) {
      reject("No item data provided");
    } else {
      // Set published to false if it's undefined
      itemData.published = itemData.published ? true : false;

      // Set the id property
      itemData.id = items.length + 1;

      // Push the new item to the items array
      items.push(itemData);

      // Resolve the promise with the updated item data
      resolve(itemData);
    }
  });
}

// Add the getItemsByCategory function
function getItemsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredItems = items.filter(item => item.category === parseInt(category));
    if (filteredItems.length === 0) {
      reject('no results returned');
    } else {
      resolve(filteredItems);
    }
  });
}

// Add the getItemsByMinDate function
function getItemsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr);
    const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
    if (filteredItems.length === 0) {
      reject('no results returned');
    } else {
      resolve(filteredItems);
    }
  });
}

// Add the getItemById function
function getItemById(id) {
  return new Promise((resolve, reject) => {
    const item = items.find(item => item.id === parseInt(id));
    if (!item) {
      reject('no result returned');
    } else {
      resolve(item);
    }
  });
}

module.exports = {
  initialize,
  getAllItems,
  getPublishedItems,
  getCategories,
  addItem,
  getItemsByCategory,
  getItemsByMinDate,
  getItemById // Export the getItemById function
};