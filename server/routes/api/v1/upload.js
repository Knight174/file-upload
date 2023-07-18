const path = require("path");
const fs = require("fs");
const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  // 设置存储位置
  destination: function (req, file, cb) {
    cb(null, "./public/data/uploads");
  },
  // 设置存储时，文件的名称
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// 二进制文件（单文件上传）
// upload.single("file") 表示前端在传表单数据时，formData 的 key 要写成 file
router.post("/file", upload.single("file"), (req, res) => {
  const {
    file: { filename },
  } = req;
  res.json({
    code: 200,
    data: {
      url: "/data/uploads/" + filename,
    },
    message: "Single file uploaded successfully.",
  });
});

// 多文件上传（限制 10 个文件
router.post("/files", upload.array("files", 10), (req, res) => {
  const { files } = req;
  const fileUrls = files.map((file) => "/data/uploads/" + file.filename);

  res.json({
    code: 200,
    data: fileUrls || [],
    message: "Multiple files uploaded successfully.",
  });
});

// base64 文件
router.post("/file_base64", (req, res) => {
  try {
    const imgData = req.body.file; // 从请求体中读取base64字符串数据
    const fileName =
      Date.now() + "." + imgData.split(";")[0].split("/").slice(-1)[0]; // 生成文件名
    const savePath = "./public/uploads/" + fileName;
    const base64Data = imgData.replace(/^data:([A-Za-z-+/]+);base64,/, "");
    fs.writeFileSync(savePath, base64Data, { encoding: "base64" });
    res.json({
      code: 200,
      data: "/uploads/" + fileName,
    });
  } catch (error) {
    res.statusCode = 500;
    res.json({
      code: 0,
      error,
    });
  }
});

module.exports = router;
