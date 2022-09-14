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

/* fetchers */
const fetchMeta = () => client.getSingle("meta");

const fetchProjectByUID = (uid, params = {}) =>
  client.getByUID("project", uid, params);

const fetchAllProjectCategory = (params = {}) =>
  client.getAllByType("project_category", params);

const fetchWithPredicates = (predicates) => {
  return client.get({ predicates });
};

/* utils */
const getProjectCategoryOfTheProject = (project) =>
  project.data.project_category;

app.use((req, res, next) => {
  res.locals.ctx = {
    prismicH,
  };
  next();
});

app.set("views", viewPath);
app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("pages/home");
});

app.get("/about", async (req, res) => {
  const response = await fetchWithPredicates(
    prismic.predicates.any("document.type", ["about", "meta"])
  );
  const { about, meta } = response.results.reduce(
    (acc, doc) => (acc[doc.type] = doc) && acc,
    {}
  );
  res.render("pages/about", { about, meta });
});

app.get("/zones", async (req, res) => {
  const [meta, projectCategories] = await Promise.all([
    fetchMeta(),
    fetchAllProjectCategory({ fetchLinks: "project.image" }),
  ]);

  console.log(
    "projectCategories[0]: ",
    projectCategories[0].data.projects[0].project.data
  );
  res.render("pages/zones", { meta, projectCategories });
});

app.get("/details/:uid", async (req, res) => {
  console.log("DEBUG request");
  const uid = req.params.uid;
  const fetchProjectByUIDParams = {
    fetchLinks: "project_category.title",
  };

  const [meta, project] = await Promise.all([
    fetchMeta(),
    fetchProjectByUID(uid, fetchProjectByUIDParams),
  ]);
  // console.log("project.data: ", project.data);
  res.render("pages/details", { meta, project });
});

app.listen(port, () => {
  console.log("debug `viewPath`: ", viewPath);
  console.log("App listening on port " + port + ".");
});
