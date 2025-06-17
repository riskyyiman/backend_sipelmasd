const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const createToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.password) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Wrong password' });

  const token = createToken(user);
  res.json({ token, role: user.role });
};

exports.register = async (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });

  await user.save();
  res.status(201).json({ message: 'User created' });
};
