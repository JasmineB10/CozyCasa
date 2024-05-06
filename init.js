const mongoose = require("mongoose");
const initData = require("./data.js");
const path = require('path');
const Listing = require(path.join(__dirname, 'models', 'listing.js'));
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderDb";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj, owner: "66332717b2fe1f84d449e3ca"}));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
