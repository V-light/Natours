/* eslint-disable prettier/prettier */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);
    // console.log(queryObj)

    //ADVANCE FILTERINGING

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const selectBy = this.queryString.fields.split(",").join(" ");
      console.log(selectBy);
      
      this.query = this.query.select(selectBy);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
//  console.log(req.query);

// FILTERING
// const queryObj = {...req.query};
// const excludeFields = ['page','sort','limit','fields'];
// excludeFields.forEach(el => delete queryObj[el]);

// //ADVANCE FILTERINGING

// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g , match =>`$${match}`);
// // console.log(JSON.parse(queryStr));

// let  query = Tour.find(JSON.parse(queryStr));

// // sorting
// if(req.query.sort){
//   const sortBy = req.query.sort.split(',').join(' ');

//   query = query.sort(sortBy);
// }else{
//   query = query.sort('-createdAt');
// }

// SELECTING
// if(req.query.fields ){
//   const selectBy = req.query.fields.split(',').join(' ');
//   console.log(selectBy);
//   query = query.select(selectBy);
// }else{
//   query =  query.select('-__v');
// }
// query = new APIFeatures(Tour.find(), req.query).sort().limitFields().query;

// PAGINATION
// const page = req.query.page*1 ||1;
// const limit = req.query.limit*1||100;
// const skip = (page-1)*limit

// query = query.skip(skip).limit(limit);

// if(req.query.page){
//   const length = await Tour.countDocument();
//   if(skip>=length){
//     throw new Error("Page Not Found");
//   }
// }

module.exports = APIFeatures;
