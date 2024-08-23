const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, mobileNo, role, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ firstName, lastName, email, mobileNo, role, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Get user list (protected route)
router.get('/users', async (req, res) => {
    const users = await User.find({}, 'firstName lastName email role');
    res.json(users);
});

module.exports = router;
