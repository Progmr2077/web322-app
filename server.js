/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name: Jacob Rivera
Student ID: 109641233
Date: June 7th, 2024
Cyclic Web App URL: https://vercel.com/new/progmr2077s-projects/success?developer-id=&external-id=&redirect-url=&branch=main&deploymentUrl=web322-qnmrguwfl-progmr2077s-projects.vercel.app&projectName=web322-app&s=https%3A%2F%2Fgithub.com%2FProgmr2077%2Fweb322-app&gitOrgLimit=&hasTrialAvailable=1&totalProjects=1&slug=app-future&slug=en-US&slug=new&slug=progmr2077s-projects&slug=success
GitHub Repository URL: https://github.com/Progmr2077/web322-app
********************************************************************************/

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
const upload = multer();

// Middleware to handle active route
app.use((req, res, next) => {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});

// Custom Handlebars helpers
const handlebars = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    navLink: (url, options) => {
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
    equal: (lvalue, rvalue, options) => {
      if (arguments.length < 3) {
        throw new Error("Handlebars Helper equal needs 2 parameters");
      }
      return lvalue != rvalue ? options.inverse(this) : options.fn(this);
    },
    formatDate: (dateObj, options) => {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return options.fn({
        formattedDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      });
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
  let viewData = {};

  try {
    let items = [];

    if (req.query.category) {
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await storeService.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
    let item = items[0];

    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {
  let viewData = {};

  try {
    let items = [];

    if (req.query.category) {
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await storeService.getPublishedItems();
    }

    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    viewData.item = await storeService.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    let categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  res.render('shop', { data: viewData });
});

app.get('/items', async (req, res) => {
  try {
    let items;
    if (req.query.category) {
      items = await storeService.getItemsByCategory(req.query.category);
    } else if (req.query.minDate) {
      items = await storeService.getItemsByMinDate(req.query.minDate);
    } else {
      items = await storeService.getAllItems();
    }
    if (items.length > 0) {
      res.render('items', { items: items, category: req.query.category || null });
    } else {
      res.render('items', { message: "no results" });
    }
  } catch {
    res.render('items', { message: "no results" });
  }
});

app.get('/categories', async (req, res) => {
  try {
    let categories = await storeService.getCategories();
    if (categories.length > 0) {
      res.render('categories', { categories: categories });
    } else {
      res.render('categories', { message: "no results" });
    }
  } catch {
    res.render('categories', { message: "no results" });
  }
});

// New route to render add category page
app.get('/categories/add', (req, res) => {
  res.render('addCategory', { title: 'Add Category' });
});

// New route to handle adding a category
app.post('/categories/add', async (req, res) => {
  try {
    await storeService.addCategory(req.body);
    res.redirect('/categories');
  } catch {
    res.status(500).send('Unable to create category');
  }
});

// New route to delete a category by ID
app.get('/categories/delete/:id', async (req, res) => {
  const categoryId = req.params.id;
  try {
    await storeService.deleteCategoryById(categoryId);
    res.redirect('/categories');
  } catch {
    res.status(500).send('Unable to Remove Category / Category not found');
  }
});

// New route to delete an item by ID
app.get('/items/delete/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    await storeService.deletePostById(itemId);
    res.redirect('/items');
  } catch {
    res.status(500).send('Unable to Remove Item / Item not found');
  }
});

app.get('/items/add', async (req, res) => {
  try {
    // Fetch categories to populate the dropdown in the addPost view
    let categories = await storeService.getCategories();
    res.render('addPost', { title: 'Add Item', categories: categories });
  } catch {
    // If fetching categories fails, pass an empty array
    res.render('addPost', { title: 'Add Item', categories: [] });
  }
});

app.get('/item/:value', async (req, res) => {
  try {
    let item = await storeService.getItemById(req.params.value);
    res.render('item', { title: 'Item Details', item: item });
  } catch {
    res.render('error', { message: "Item not found" });
  }
});

app.post('/items/add', upload.single('featureImage'), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result.url);
          else reject(error);
        }).end(req.file.buffer);
      });
      imageUrl = result;
    }
    req.body.featureImage = imageUrl;
    await storeService.addItem(req.body);
    res.redirect('/items');
  } catch {
    res.render('error', { message: "Failed to add item" });
  }
});

app.post('/item/update', upload.single('featureImage'), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result.url);
          else reject(error);
        }).end(req.file.buffer);
      });
      imageUrl = result;
    }
    req.body.featureImage = imageUrl;
    await storeService.updateItem(req.body);
    res.redirect('/items');
  } catch {
    res.render('error', { message: "Failed to update item" });
  }
});

const HTTP_PORT = process.env.PORT || 8080;

storeService.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on: ${HTTP_PORT}`);
  });
}).catch((err) => {
  console.log(err);
});