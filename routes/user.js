const express = require('express')
const userRouter = express.Router()
const md5 = require("md5");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { getDbInstance } = require('../db')
const {ObjectId} = require('mongodb');

userRouter.get("/", async (req, res) => {
  // fs.readFile("users.json", "utf8", function (err, data) {
  //   console.log(data);
  //   res.status(200).json(JSON.parse(data)).end();
  // });

  const users = await (await getDbInstance()).collection('users').find({}).toArray();
  console.log("users", users)
  res.status(200).json(users).end();
});

userRouter.get("/:id", async (req, res) => {
  let users;
  // fs.readFile("users.json", "utf8", function (err, data) {
  //   users = JSON.parse(data);
  //   const user = users.find((user) => user.id === req.params.id);
  //   if (!user) {
  //     return res.status(400).json({ message: "user not found!" }).end();
  //   }
  //   res.status(200).json(user).end();
  // });

try {
  const user = await (await getDbInstance()).collection('users').findOne({ "_id" : ObjectId(req.params.id) });
  res.status(200).json(user).end();
} catch (error) {
  res.status(400).json({error: error.message});;
}
});

userRouter.post("/", async (req, res) => {
  if (req.body.password.length < 5) {
    return res.status(400).json({ message: "password invalid" }).end();
  }
  const user = await (await getDbInstance()).collection('users').insertOne( {
    username: req.body.username,
    password: md5(req.body.password),
  });
  console.log(user)
  return res.status(200).json({
    ...req.body,
    id: user.insertedId,
  }).end()
});

userRouter.put("/:id", async (req, res) => {
  // const user = users.find((user) => user.id === req.params.id);
  // if (!user) {
  //   return res.status(400).json({ message: "user not found!" }).end();
  // }
  // user.username = req.body.username;
  // user.password = md5(req.body.password);

  try {
    
    var myquery = { _id: ObjectId(req.params.id)};
    var newvalues ={ $set:  { username: req.body.username, password: md5(req.body.password) }};
  
    const user = await (await getDbInstance()).collection('users').updateOne(myquery, newvalues);
    console.log("updated user", user)
    res.status(200).json(user).end();
  } catch (error) {
    res.status(400).json({ message: "update fail" }).end();
  }
});

userRouter.delete("/:id", async (req, res) => {
  // const user = users.find((user) => user.id === req.params.id);
  // if (!user) {
  //   return res.status(400).json({ message: "user not found!" }).end();
  // }
  // users = users.filter((user) => user.id !== req.params.id);

  // var myquery = { _id: req.params.id};

  try {    
    const user = await (await getDbInstance()).collection('users').deleteOne({ "_id" : ObjectId(req.params.id) });
    console.log("updated user", user)
  
    res.status(200).json({ message: "delete success" }).end();
  } catch (error) {
    res.status(400).json({ message: "delete fail" }).end();
  }

});

module.exports = userRouter