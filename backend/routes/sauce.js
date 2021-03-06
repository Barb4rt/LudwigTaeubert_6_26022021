const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')

const sauceCtrl = require('../controllers/sauce');

router.post('/', auth, multer, sauceCtrl.createThing);
router.post('/:id/like', auth, sauceCtrl.likeOne);
router.put('/:id', auth, multer, sauceCtrl.modifyThing);
router.delete('/:id', auth, sauceCtrl.deleteThing)
router.get('/:id', auth, sauceCtrl.getOneThing)
router.get('/', auth, sauceCtrl.getAllThing)

module.exports = router;

