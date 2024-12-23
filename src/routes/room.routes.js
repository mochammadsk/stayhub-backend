module.exports = (app) => {
  const room = require('../controllers/room.controller');
  const { auth } = require('../middelware/auth.middleware');
  const uploadImages = require('../config/multer');
  const router = require('express').Router();
  const dotenv = require('dotenv');

  dotenv.config();

  // Get all rooms
  router.get('/', (req, res) => {
    room.getAll(req, res);
  });

  // Get room by id
  router.get('/:id', (req, res) => {
    room.getById(req, res);
  });

  // Get room by type
  router.get('/type/:id', (req, res) => {
    room.getByType(req, res);
  });

  // Get room by user ID
  router.get('/user/:id', auth('user'), (req, res) => {
    room.getByUser(req, res);
  });

  // Create room
  router.post('/add', auth('admin'), uploadImages, (req, res) => {
    room.create(req, res);
  });

  // Update room by id
  router.put('/update/:id', auth('admin'), uploadImages, (req, res) => {
    room.update(req, res);
  });

  // Delete room by id
  router.delete('/delete/:id', auth('admin'), (req, res) => {
    room.deleteById(req, res);
  });

  // Delete all rooms
  router.delete('/delete', auth('admin'), (req, res) => {
    room.deleteAll(req, res);
  });

  app.use('/room', router);
};
