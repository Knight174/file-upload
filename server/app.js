var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

// 导入路由
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
// api/v1/upload
const upload = require("./routes/api/v1/upload");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// 中间件导入
app.use(logger("dev"));
app.use(express.json()); // 解析请求体中的 json 字符串
app.use(express.urlencoded({ extended: false })); // 解析 url 编码数据（表单数据）
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); // 静态资源目录
app.use(cors()); // 处理 cors 跨域

// 使用路由
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/v1/upload", upload);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
