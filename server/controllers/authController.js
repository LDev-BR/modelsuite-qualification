const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { buildTalentProfileUpdate } = require('../utils/profile');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profile: user.profile,
  profileCompletedAt: user.profileCompletedAt,
});

const buildAuthResponse = (user) => ({
  ...serializeUser(user),
  token: generateToken(user._id, user.role),
});

// @desc  Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json(buildAuthResponse(user));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Complete or update the logged-in talent profile
// @route PUT /api/auth/profile
// @access Talent
const updateProfile = async (req, res) => {
  if (req.user.role !== 'Talent') {
    return res.status(403).json({ message: 'Only talent users can update onboarding profiles' });
  }

  try {
    const profile = buildTalentProfileUpdate(req.body);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        profile,
        profileCompletedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).select('-password');

    res.json(serializeUser(user));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, updateProfile };
