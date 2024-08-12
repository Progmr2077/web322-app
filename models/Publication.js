const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  body: { type: String, required: true },
  title: { type: String, required: true },
  postDate: { type: Date, default: Date.now },
  featureImage: { type: String },
  published: { type: Boolean, default: false },
  price: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
});

const Publication = mongoose.model('Publication', publicationSchema);
module.exports = Publication;