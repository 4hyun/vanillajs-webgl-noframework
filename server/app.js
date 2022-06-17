import express from "express";
import path from "path";
const app = express();
const port = 3002;
const viewPath = path.join(__dirname, "..", "views");
app.set("views", viewPath);
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("pages/home");
});
app.get("/about", (req, res) => {
  res.render("pages/about");
});
app.get("/zones", (req, res) => {
  res.render("pages/zones");
});
app.get("/detail/:id", (req, res) => {
  res.render("pages/detail");
});

app.listen(port, () => {
  console.log("debug `viewPath`: ", viewPath);
  console.log("App listening on port " + port + ".");
});
