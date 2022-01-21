const mongoose = require("mongoose");
const fs = require('fs');
const dotenv = require("dotenv");
const Tour = require('./../../models/tourModel');

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log("DB connections successful");
  });

  const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

  const importData =async ()=>{
    try{
        await Tour.create(tours);
        console.log("Data Succefully Loaded");
        process.exit();
    }catch(err){
        console.log(err)
    }  
    
      
  }

  const deleteData =async ()=>{
    try{
        await Tour.deleteMany();
        console.log("Deleted");
        process.exit();
    }catch(err){
        console.log(err)
    }  
      
  }
  if(process.argv[2] === "--import"){
      importData()
  }else if(process.argv[2] === "--delete"){
      deleteData()
  }
//   console.log(process.argv);