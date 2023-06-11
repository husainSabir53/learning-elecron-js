const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  updatedTime: String,
  Number: Number,
});

const appState = new mongoose.Schema({
  active: {
    type: Boolean,
    default: false
},
openedAt : String,
closedAt: String,
name: String
})

const client = new mongoose.Schema({
  clientName: String
})


const Item = mongoose.model('Item', itemSchema);
const Client = mongoose.model('Client', client)
const AppState = mongoose.model('AppState', appState);

module.exports = {Item, AppState, Client};