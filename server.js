 /* eslint-disable prettier/prettier */
const mongoose = require('mongoose'); //DRIVER HELPS FOR CONNECTING TO THE DATBASE //INSTALL= npm i mongoose@5 (version 5.)
const dotenv = require('dotenv');

process.on('uncaughtExpection', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION Shutting down...');
  process.exit(1);
})

dotenv.config({ path: './config.env' });
const app = require('./app');


const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    // useFindAndModity: false, (Warning: the options [useFindAndModity] is not supported : Use `node --trace-warnings ...` to show where the warning was created)
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log(con.connections); CONENCTION details
    console.log('DB connection sucesfull');
  });

const port = process.env.PORT || 3000;
// eslint-disable-next-line prettier/prettier
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App runing on port ${port}... `);
});

process.on('unhandledRejection' , err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});



