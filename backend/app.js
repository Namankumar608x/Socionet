// Core Module
const path = require('path');
//env file
require('dotenv').config();

// External Module
const express = require('express');
const { default: mongoose } = require('mongoose');
const cors = require('cors');
const DB_PATH = process.env.MONGO_URI;

//Local Module

const app = express();
//auth route
const authRoutes = require('./routes/authRoutes');
//user route
const userRoutes = require('./routes/userRoutes');

app.use(express.urlencoded());
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);



const PORT = 3001;

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
  app.listen(PORT, () => {
    console.log(`Server running on address http://localhost:${PORT}`);
  });
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});
