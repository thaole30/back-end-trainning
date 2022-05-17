const express = require("express");
const uploadRouter = express.Router();
const fs = require("fs");
const multer = require("multer");
const { getDbInstance } = require("../db");
const { ObjectId } = require("mongodb");
const sharp = require("sharp");

const maxSize = 1 * 1024 * 1024;
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("destination");
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    console.log("file", file);
    cb(null, file.fieldname + "-" + Date.now() + ".png"); //qui tắc đặt filet name filename
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, callback) {
    console.log("filter", file);
    if (file.originalname.startsWith("napa")) {
      return callback(null, true);
    }
    callback(new Error("File name not start with napa"));
  },
});

//UPLOAD FILE
// uploadRouter.post("/", upload.single("myFile"), async (req, res) => {
//   // "myFile" is fieldname (do thư viện định nghĩa)

//   try {
//     console.log("request file", req.file);
//     const file = req.file;

//     if (!file) {
//       const error = new Error("Please upload a file");
//       error.httpStatusCode = 400;
//       return next(error);
//     }

//     const resize = await sharp(file.path)
//       .resize(200, 200)
//       .toFile(`./resizes/resize-${file.filename}`);
//     console.log("resize", resize);

//     const result = await (await getDbInstance())
//       .collection("uploads")
//       .insertOne({
//         ...file,
//         pathOri: file.path,
//         pathResize: `resizes\\resize-${file.filename}`,
//         nameResize: `resize-${file.filename}`,
//       });
//     console.log("result", result);
//     res.send({ fileId: result.insertedId });
//   } catch (error) {
//     console.log("error", error);
//   }

//   // return res.status(200).json(file).end()
// });



uploadRouter.post("/", (req, res) => {
  const uploadFile = upload.single("myFile");
  try {
    uploadFile(req, res, async (err) => {
      if (err) {
        res.send(err.message);
        return;
      }
      console.log("file", req.file);
      const file = req.file;
      if (!file) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
      }
      const result = await (await getDbInstance())
        .collection("uploads")
        .insertOne(file);
      const value = result.insertedId;
      res.send({
        "url-ori": `http://localhost:3000/download/ori/${value}`,
        "url-resize": `http://localhost:3000/download/resize/${value}`,
      });
    });
    
  } catch (error) {
    console.log("error", error);
  }
})


//UPLOAD MANY FILES
const uploadMiddlewareMutiple = (req, res, next) => {
  const uploadFile = upload.array("myFiles", 10);
  uploadFile(req, res, async (err) => {
    if (err) {
      return res.json({ error: err.message });
    }
    next();
  });
};

uploadRouter.post("/multiple", uploadMiddlewareMutiple, async (req, res) => {
  // "myFile" is fieldname (do thư viện định nghĩa)
  const files = req.files;
  console.log("request files", req.files);
  if (!files) {
    const error = new Error("Please upload files");
    error.httpStatusCode = 400;
    return next(error);
  }


  const results = await (await getDbInstance())
    .collection("uploads")
    .insertMany(files);
  console.log("results", results);

  let arrIds = Object.values(results.insertedIds);
  console.log("arrIds", arrIds);

  const links = arrIds.map((id) => {
    return {
      "url-ori": `http://localhost:3000/download/ori/${id}`,

      "url-resize": `http://localhost:3000/download/resize/${id}`,
    };
  });



  return res.status(200).json({ links: links }).end()
});

module.exports = uploadRouter;
