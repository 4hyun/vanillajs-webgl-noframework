"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])();
var port = 3002;
app.set("views", _path["default"].join(__dirname, "..", "views"));
app.set("view engine", "pug");
app.get("/", function (req, res) {
  res.render("index");
});
app.listen(port, function () {
  console.log(_path["default"].join(__dirname));
  console.log("App listening on port " + port + ".");
});