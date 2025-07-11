const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB URI
const mongoURI = 'mongodb+srv://Dhir:Dhir1000@cluster0.wedwkly.mongodb.net/message_app?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(' Connected to MongoDB Atlas'))
.catch(err => console.error(' MongoDB connection error:', err));

// Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// User schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', userSchema);

// Register route
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  try {
    const user = new User({ email, username, password });
    await user.save();
    res.send(' User registered successfully');
    res.redirect('/home.html');
  } catch (err) {
    console.error(err);
    res.status(400).send(' Registration failed (possibly duplicate email/username)');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).send(' Invalid email or password');
    }
    res.redirect('/home.html');
  } catch (err) {
    console.error(err);
    res.status(500).send(' Server error');
  }
});

// send friend request
app.post('/send-request', async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (senderId === receiverId) return res.status(400).send(" Can't send request to yourself.");

  const receiver = await User.findById(receiverId);
  if (!receiver) return res.status(404).send(" User not found");

  if (receiver.friendRequests.includes(senderId) || receiver.friends.includes(senderId)) {
    return res.status(400).send(" Already requested or already friends.");
  }

  receiver.friendRequests.push(senderId);
  await receiver.save();

  res.send(" Friend request sent");
});

//accept
app.post('/accept-request', async (req, res) => {
  const { receiverId, senderId } = req.body;

  const receiver = await User.findById(receiverId);
  const sender = await User.findById(senderId);

  if (!receiver || !sender) return res.status(404).send(" User not found");

  if (!receiver.friendRequests.includes(senderId)) {
    return res.status(400).send(" No such friend request");
  }

  receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
  receiver.friends.push(senderId);
  sender.friends.push(receiverId);

  await receiver.save();
  await sender.save();

  res.send(" Friend request accepted");
});

//reject
app.post('/reject-request', async (req, res) => {
  const { receiverId, senderId } = req.body;

  const receiver = await User.findById(receiverId);
  if (!receiver) return res.status(404).send(" User not found");

  receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
  await receiver.save();

  res.send(" Friend request rejected");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
