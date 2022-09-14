import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from "express";
import path from "path";
import * as prismicH from "@prismicio/helpers";
import * as prismic from "@prismicio/client";
import { client } from "./lib/prismic/client";

const app = express();
const port = 3002;
const viewPath = path.join(__dirname, "..", "views");

const handleLinkResolver = (doc) => {
  return "/";
};

app.use((req, res, next) => {
  res.locals.ctx = {
    prismicH,
  };
  next();
});

console.log("PRISMIC_ENDPOINT :", process.env.PRISMIC_ENDPOINT);
app.set("views", viewPath);
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("pages/home");
});
app.get("/about", async (req, res) => {
  const response = await client.get({
    predicates: prismic.predicates.any("document.type", ["about", "meta"]),
  });
  const { about, meta } = response.results.reduce(
    (acc, doc) => (acc[doc.type] = doc) && acc,
    {}
  );
  console.log(" about.gallery: ", about.gallery);
  res.render("pages/about", { about, meta });
});
app.get("/zones", (req, res) => {
  res.render("pages/zones");
});
app.get("/details/:uid", async (req, res) => {
  console.log("DEBUG request");
  const uid = req.params.uid;
  const fetchMeta = () => client.getSingle("meta");
  const fetchProjectByUID = () => client.getByUID("project", uid);
  const fetchProjectCategoryOfTheProject = (id) =>
    client.get({
      predicates: prismic.predicates.at("my.project.project_category", id),
    });
  const [meta, project] = await Promise.all([
    fetchMeta(),
    fetchProjectByUID(uid),
  ]);
  const projectCategoryOfTheProject = await fetchProjectCategoryOfTheProject(
    getProjectCategoryOfTheProject(project).id
  );

  // console.log("DEBUG project: ", project);

  console.log(
    "DEBUG projectCategoryOfTheProject: ",
    projectCategoryOfTheProject
  );
  res.render("pages/details", { meta, project });
});

app.listen(port, () => {
  console.log("debug `viewPath`: ", viewPath);
  console.log("App listening on port " + port + ".");
});

const getProjectCategoryOfTheProject = (project) =>
  project.data.project_category;
