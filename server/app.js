import express from "express";
import path from "path";
const app = express();
const port = 3002;
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => {
  console.log(path.join(__dirname));
  console.log("App listening on port " + port + ".");
});
