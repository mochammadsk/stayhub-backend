module.exports = (app) => {
  const user = require('../controllers/user.controller');
  const { auth } = require('../middelware/auth.middleware');
  const uploadImages = require('../config/multer');
  const router = require('express').Router();

  // Get user profile
  router.get('/profile', auth('user'), (req, res) => {
    user.getProfile(req, res);
  });

  // Update profile data
  router.put('/profile/update', auth('user'), uploadImages, (req, res) => {
    user.updateProfile(req, res);
  });

  // Delete photo profile
  router.delete('/profile/update', auth('user'), uploadImages, (req, res) => {
    user.deletePhotoProfile(req, res);
  });

  app.use('/user', router);
};
