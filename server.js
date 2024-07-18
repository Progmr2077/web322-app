/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Jacob Rivera
Student ID: 109641233
Date: June 7th, 2024
Cyclic Web App URL: 
GitHub Repository URL: https://github.com/Progmr2077/web322-app.git
********************************************************************************/

// server.js
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dnhzlp3mb',
  api_key: '224993467718837',
  api_secret: '4MbmRpIBcZhdRWWjJSl0Wt9D2dg',
  secure: true
});

// Multer setup
const upload = multer(); // no { storage: storage } since we are not using disk storage

// Middleware to handle active route
app.use(function(req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Custom Handlebars helpers
const handlebars = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main', // Set the default layout
  helpers: {
    navLink: function(url, options){
      return (
        '<li class="nav-item">' +
        '<a ' +
        (url == app.locals.activeRoute ? 'class="nav-link active" ' : 'class="nav-link" ') +
        'href="' +
        url +
        '">' +
        options.fn(this) +
        '</a>' +
        '</li>'
      );
    },
    equal: function(lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    }
  }
});

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});


app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "item" by category
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await itemData.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await itemData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/items', (req, res) => {
  if (req.query.category) {
    storeService.getItemsByCategory(req.query.category).then((items) => {
      res.render('items', { items: items, category: req.query.category });
    }).catch(() => {
      res.render('items', { message: "no results" });
    });
  } else if (req.query.minDate) {
    storeService.getItemsByMinDate(req.query.minDate).then((items) => {
      res.render('items', { items: items });
    }).catch(() => {
      res.render('items', { message: "no results" });
    });
  } else {
    storeService.getAllItems().then((items) => {
      res.render('items', { items: items });
    }).catch(() => {
      res.render('items', { message: "no results" });
    });
  }
});

app.get('/categories', (req, res) => {
  storeService.getCategories().then((categories) => {
    res.render('categories', { categories: categories });
  }).catch(() => {
    res.render('categories', { message: "no results" });
  });
});

app.get('/items/add', (req, res) => {
  res.render('addPost', { title: 'Add Item' });
});

app.get('/item/:value', (req, res) => {
  storeService.getItemById(req.params.value).then((item) => {
    res.render('item', { title: 'Item Details', item: item });
  }).catch(() => {
    res.render('error', { message: "Item not found" });
  });
});

app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.addItem(req.body).then(() => {
      res.redirect('/items');
    }).catch(() => {
      res.render('error', { message: "Failed to add item" });
    });
  }
});

app.post('/item/update', upload.single('featureImage'), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      return result;
    }

    upload(req).then((uploaded) => {
      processItem(uploaded.url);
    });
  } else {
    processItem("");
  }

  function processItem(imageUrl) {
    req.body.featureImage = imageUrl;
    storeService.updateItem(req.body).then(() => {
      res.redirect('/items');
    }).catch(() => {
      res.render('error', { message: "Failed to update item" });
    });
  }
});

const HTTP_PORT = process.env.PORT || 8080;

storeService.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`Server is listening on port ${HTTP_PORT}`);
  });
}).catch((err) => {
  console.error("Unable to start server:", err);
});