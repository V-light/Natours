/* eslint-disable consistent-return */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */

const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("./../utis/apiFeatures");
const catchAsync = require("./../utis/catchAsync");
const  AppError = require("./../utis/appError");




exports.getBest = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = "ratingsAverage price";
  req.query.fields =
    "name duration maxGroupSize difficulty ratingsAverage ratingsQuantity summary description";
  next();
};



exports.getAllTours = catchAsync (async (req, res , next) => {
  


    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    
   
    res.status(200).json({
      status: "success",
      length: tours.length,
      data: {
        tours,
      },
    });
 
});

exports.getTours = catchAsync (async (req, res, next) => {

    const tour = await Tour.findById(req.params.id).populate('review');

    if(!tour){
      return next(new AppError("No Tour Found with ID", 404));
    }
    res.status(200).json({
      status: "done",
      data: tour,
    });
   
});



exports.createTours = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const tours = await Tour.create(req.body);
  res.status(200).json({
    status: "success",

    data: {
      tours,
    },
  });

});

exports.updateTours = catchAsync (async (req, res, next) => {
  
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      message: tour,
    });
  
});

exports.deleteTours = catchAsync (async (req, res, next) => {

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
      return next(new AppError("No Tour Found with ID", 404));
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
 
});

exports.getTourStats =catchAsync( async(req,res , next) =>{
  
    const stats = await  Tour.aggregate([
      {
        $match : {ratingsAverage : {$gte : 4.5}}
      },
      {
        $group: {
          _id : {$toUpper : '$difficulty'},
          numTours : {$sum : 1},
          numRatings : {$sum : '$ratingsQuantity'},
          avgRating : {$avg : '$ratingsAverage'},
          avgPrice : { $avg : '$price'},
          minPrice: {$min: '$price'},
          maxPrice : {$max: '$price'}
        }
      },
      {
        $sort :{
          avgPrice: 1
        }
      }
    ]);
    
    res.status(200).json({
      status: "success",
      data: stats
      
    });
  
});

exports.getMonthlyPlan = catchAsync(async(req, res, next) => {
 
    const year = req.params.year*1;
    const plan = await Tour.aggregate([
      {
        $unwind : '$startDates'
      },
      {
        $match:{
          startDates: {
            $gte : new Date(`${year}-01-01`),
            $lte : new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group :{
          _id : {$month : '$startDates'},
          numToursStarts : {$sum : 1},
          tours : {$push : '$name'}
        }
      },
      {
        $addFields : {month: '$_id'}
      },
      {
        $project :{
          _id : 0
        }
      },
      {
        $sort : {numTourStarts : -1}
      }
    ]);
    res.status(200).json({
      status: "success",
      data: plan
      
    });


 
});