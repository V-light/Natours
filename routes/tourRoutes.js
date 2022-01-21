const express = require('express');
const fs = require("fs");
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();


router.use('/:tourId/reviews', reviewRouter)

// router.param('id', tourController.checkID);
router.route("/top-5-best").get(tourController.getBest,tourController.getAllTours)

router.route("/tour-stats").get(tourController.getTourStats)
router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan)

router
  .route("/")
  .get(authController.protect ,tourController.getAllTours)
  .post(tourController.createTours);

router
  .route("/:id")
  .get(tourController.getTours)
  .patch(tourController.updateTours)
  .delete( authController.protect,authController.restrictTo("admin", "lead-guide") ,tourController.deleteTours);

module.exports = router;