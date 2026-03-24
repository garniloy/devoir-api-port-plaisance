const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, process.env.APP_KEY);
    req.user = decoded; 
    next();
  } catch (err) {
    
    res.clearCookie('token');
    return res.redirect('/');
  }
};