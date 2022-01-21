const mongoose = require("mongoose");
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Name is required"],
    unique: true,
  },
  duration: {
    type: Number,
    required: [true, "Duration is Required"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "Group size is required"],
  },
  difficulty: {
    type: String,
    trim: true,
    required: [true, "Difficulty  is required"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true, "Summary is required"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select : false
  },
  startDates: [Date],
  startLocation: {
    type:{
      type: String,
      default: 'Point',
      enum : ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type:{
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides:[
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  reviews : {
    type: mongoose.Schema.ObjectId,
    ref: 'Review'
  }
 
}, {
  toJSON : {virtuals: true},
  toObject : {virtuals: true},
});

tourSchema.virtual('DurationWeeks').get(function(){
  return this.duration/7;
});


tourSchema.virtual('review', {
  ref: 'Review',
  foreignField : 'tour',
  localField: '_id'
})

tourSchema.pre(/^find/, function(next) {
  // this points to the current query
  this.populate({
      path: 'guides'
  })
  next();
});


const Tour = mongoose.model("Tour", tourSchema);

// const newTour = new Tour({
//   name: "The river swimming",
//   rating: 4.9,
//   price: 488,
// });

// newTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

module.exports = Tour;
