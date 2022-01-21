const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

process.on('uncaughtException', err=>{
  console.log(err.name, err.message);
  process.exit(1);
  
});


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




const port = 3000;
const server = app.listen(port, () => {
  console.log("Server has started...");
});

process.on('unhandledRejection', err=>{
  console.log(err.name, err.message);
  server.close(()=>{
    process.exit(1);
  });
});
