const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const publicationSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    publicationDate: Date,
    // other fields as needed
});

const Publication = mongoose.model('Publication', publicationSchema);

module.exports = Publication;
