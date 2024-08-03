
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

let items = [];
let categories = [];

module.exports.initialize = function() {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.getAllItems = function() {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.getPublishedItems = function() {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.getPublishedItemsByCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.getCategories = function() {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.getItemsByCategory = function(categoryId) {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.getItemById = function(id) {
  return new Promise((resolve, reject) => {
    reject();
  });
};

module.exports.addItem = function(itemData) {
  return new Promise((resolve, reject) => {
    reject();
  });
};
