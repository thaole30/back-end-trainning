const express = require("express");
const downloadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require("../db");
const { ObjectId } = require("mongodb");
const sharp = require("sharp");


//DOWNLOAD FILE
downloadRouter.get("/ori/:id", async (req, res) => {
    //step 1: get paramid
    const id = req.params.id;
    //step2: get metadata by id using findOne
    const metaData = await (await getDbInstance())
      .collection("uploads")
      .findOne({ _id: ObjectId(id) });
    console.log("metaData", metaData);
    //step3: read file and then send to client
    const dir = `./uploads/${metaData.filename}`;
    console.log("dir", dir);
    res.download(dir, metaData.originalname);
    // res.status(200).json(file).end()
  });
downloadRouter.get("/resize/:id", async (req, res) => {
    console.log("DOWNLOAD RESIZEEEEEE");
    //step 1: get paramid
    const id = req.params.id;
    //step2: get metadata by id using findOne
    const metaData = await (await getDbInstance())
      .collection("uploads")
      .findOne({ _id: ObjectId(id) });
    console.log("metaData", metaData);
    //step3: read file and then send to client
    const dir = `./uploads/${metaData.filename}`;
    console.log("dir", dir);
    // res.download(dir, `${metaData.nameResize}`);
    sharp(dir).resize(150, 150).pipe(res);
    res.header('Content-Disposition', 'attachment; filename="' + metaData.filename + '"');
    // res.status(200).json(file).end()
  });
  

module.exports = downloadRouter;