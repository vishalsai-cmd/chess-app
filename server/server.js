
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

const app = express();


app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
  }));
app.use(express.json());

mongoose.connect("mongodb+srv://vishalsair2005:sai123@cluster0.ekh6m1l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});


const gameRoutes = require('./routes/game');
app.use('/api/game', gameRoutes);


const PORT =5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});