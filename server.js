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

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary');
const streamifier = require('streamifier');
const storeService = require('./store-service');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.engine('.hbs', exphbs.engine(( {extname: '.hbs' })));
app.set('view engine', '.hbs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dnhzlp3mb', 
  api_key: '224993467718837', 
  api_secret: '4MbmRpIBcZhdRWWjJSl0Wt9D2dg', 
  secure: true
});

// Multer setup
const upload = multer(); // no { storage: storage } since we are not using disk storage

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/shop', (req, res) => {
  storeService.getPublishedItems().then((data) => {
    res.render('shop', { title: 'Shop', items: data });
  }).catch((err) => {
    res.status(404).render('error', { message: err });
  });
});

app.get('/items', (req, res) => {
  if (req.query.category) {
    storeService.getItemsByCategory(req.query.category).then((data) => {
      res.render('items', { items: data, category: req.query.category });
    }).catch((err) => {
      res.status(404).json({ message: err });
    });
  } else if (req.query.minDate) {
    storeService.getItemsByMinDate(req.query.minDate).then((data) => {
      res.render('items', { items: data });
    }).catch((err) => {
      res.status(404).json({ message: err });
    });
  } else {
    storeService.getAllItems().then((data) => {
      res.render('items', { items: data });
    }).catch((err) => {
      res.status(404).json({ message: err });
    });
  }
});

app.get('/categories', (req, res) => {
  storeService.getCategories().then((data) => {
    res.render('categories', { categories: data });
  }).catch((err) => {
    res.status(404).json({ message: err });
  });
});

app.get('/items/add', (req, res) => {
  res.render('add-item', { title: 'Add Item' });
});

// Add the /item/:value route
app.get('/item/:value', (req, res) => {
  storeService.getItemById(req.params.value).then((data) => {
    res.render('item', { title: 'Item Details', item: data });
  }).catch((err) => {
    res.status(404).render('error', { message: err });
  });
});

// POST route to handle item submission
app.post('/items/add', upload.single('featureImage'), (req, res) => {
  if (req.file) {
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
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
      }).catch((err) => {
          res.status(500).render('error', { message: "Unable to add item" });
      });
  }
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

storeService.initialize().then(() => {
  app.listen(process.env.PORT || 8080, () => {
    console.log('Express http server listening on', process.env.PORT || 8080);
  });
}).catch((err) => {
  console.error(err);
});