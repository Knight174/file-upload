const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const multer = require('multer');
const multiparty = require('multiparty');

const storage = multer.diskStorage({
  // 设置存储位置
  destination: function (req, file, cb) {
    cb(null, './public/data/uploads');
  },
  // 设置存储时，文件的名称
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// 二进制文件（单文件上传）
// upload.single("file") 表示前端在传表单数据时，formData 的 key 要写成 file
router.post('/file', upload.single('file'), (req, res) => {
  const {
    file: { filename },
  } = req;
  res.json({
    code: 200,
    data: {
      url: '/data/uploads/' + filename,
    },
    message: 'Single file uploaded successfully.',
  });
});

// 多文件上传（限制 10 个文件
router.post('/files', upload.array('files', 10), (req, res) => {
  const { files } = req;
  if (!files.length) {
    res.json({
      code: 500,
      message: '请重新上传！',
    });
  }
  const fileUrls = files.map((file) => '/data/uploads/' + file.filename);

  res.json({
    code: 200,
    data: fileUrls || [],
    message: 'Multiple files uploaded successfully.',
  });
});

// base64 文件
router.post('/file_base64', (req, res) => {
  try {
    const imgData = req.body.file; // 从请求体中读取base64字符串数据，json 中的要写 "file"
    const fileName =
      Date.now() + '.' + imgData.split(';')[0].split('/').slice(-1)[0]; // 生成文件名
    const savePath = './public/data/uploads/' + fileName;
    const base64Data = imgData.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(savePath, base64Data, { encoding: 'base64' });
    res.json({
      code: 200,
      data: '/uploads/' + fileName,
    });
  } catch (error) {
    res.statusCode = 500;
    res.json({
      code: 500,
      error,
    });
  }
});

// 切片上传
router.post('/multipart', upload.single('chunk'), (req, res) => {
  const { body } = req;
  console.log(body);
  res.json({
    code: 200,
    message: `切片：${body.index} ，上传成功！`,
  });
});

// 切片上传完成，进行文件合并
router.post('/multipart_merge', (req, res) => {
  const body = req.body;
  console.log('合并文件', body);
  res.json({
    code: 200,
    message: `文件：${body.name}.${body.extname}， 合并成功！`,
  });
});

module.exports = router;
