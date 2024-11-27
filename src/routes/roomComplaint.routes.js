module.exports = (app) => {
  const complaint = require('../controllers/roomComplaint.controller');
  const { auth } = require('../middelware/auth.middleware');
  const { complaintImages } = require('../config/multer');
  const dotenv = require('dotenv');
  const router = require('express').Router();

  dotenv.config();

  // Get all complaint
  router.get('/', auth('admin'), (req, res) => {
    complaint.getAll(req, res);
  });

  // Get complaint by id
  router.get('/:id', auth('admin'), (req, res) => {
    complaint.getById(req, res);
  });

  // Create complaint
  router.post('/:id', auth('user'), complaintImages, (req, res) => {
    complaint.create(req, res);
  });

  // Update complaint by id
  router.put('/:id', auth('user'), complaintImages, (req, res) => {
    complaint.update(req, res);
  });

  // Delete complaint by id
  router.delete('/:id', auth('user'), (req, res) => {
    complaint.deleteById(req, res);
  });

  app.use('/complaint', router);
};