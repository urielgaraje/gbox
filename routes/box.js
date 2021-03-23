const express = require('express');
const boxController = require('./../controllers/boxController');

const router = express.Router();

router.route('/')
.get(boxController.getBoxes)
.post(boxController.extractImg, boxController.createBox);

module.exports = router;
