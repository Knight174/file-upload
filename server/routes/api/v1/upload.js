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
router.post('/multipart', (req, res) => {
  const form = new multiparty.Form();
  form.parse(req, function (err, fields, files) {
    if (err) {
      res.json({
        code: 500,
        message: '服务器端错误',
      });
    }

    // 临时转存目录
    const tempPath = './public/data/uploads/multipart/' + fields.name[0];
    // 把每次上传的切片进行统一存储到临时目录
    fs.mkdirSync(tempPath, {
      recursive: true, // 不存在即创建
    });
    // 修改路径，转存到临时目录
    fs.renameSync(files['chunk'][0].path, tempPath + '/' + fields.index[0]);
  });
  res.json({
    code: 200,
    message: `切片上传成功！`,
  });
});

// 切片上传完成，进行文件合并
router.post('/multipart_merge', (req, res) => {
  const { name, extname } = req.body;
  streamMerge(
    './public/data/uploads/multipart/' + name,
    './public/data/uploads/multipart/' + name + '.' + extname
  );
  res.json({
    code: 200,
    message: `文件：${name}.${extname}， 合并成功！`,
    data: {
      url: '/public/data/uploads/multipart/' + name + '.' + extname,
    },
  });
});

// （流合并）将源文件合并成目标文件
// chunksDir 某文件切片目录
// targetFile 目标文件
const streamMerge = (chunksDir, targetFile) => {
  const tmpFileList = fs.readdirSync(chunksDir); // 读取目录中的文件，返回文件名称组成的列表
  const fileList = tmpFileList.map((name) => ({
    name,
    filePath: path.resolve(chunksDir, name),
  }));
  // 创建写入流，不管读取文件流，然后写入目标文件
  const fileWriteStream = fs.createWriteStream(targetFile);
  writeStream(fileList, fileWriteStream, chunksDir);
};

/**
 * 合并指定目录的每一个切片，然后移除指定目录
 * @param {*} fileList        文件数据
 * @param {*} fileWriteStream 最终的写入结果
 * @param {*} chunksDir     文件路径
 */
const writeStream = (fileList, fileWriteStream, chunksDir) => {
  if (!fileList.length) {
    // 如果文件切片列表为空，结束流写入
    fileWriteStream.end();
    // 删除临时目录
    if (chunksDir) {
      fs.rmdirSync(chunksDir, { recursive: true, force: true });
      return;
    }
  }
  const data = fileList.shift(); // 取第一个数据（每次从头部取一个出来处理，直到取完）
  const { filePath: chunkFilePath } = data;
  const currentReadStream = fs.createReadStream(chunkFilePath); // 读取文件
  // 将读取到的文件流通过管道与写入流合并在一起
  currentReadStream.pipe(fileWriteStream, { end: false });
  // 当读取完毕时，循环读取并拼接下一个文件数据，直到 fileList 为空
  currentReadStream.on('end', () => {
    writeStream(fileList, fileWriteStream, chunksDir);
  });
};

module.exports = router;
