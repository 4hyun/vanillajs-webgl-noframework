import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express from "express";
import logger from "morgan";
import errorHandler from "errorhandler";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import path from "path";
import * as prismicH from "@prismicio/helpers";
import * as prismic from "@prismicio/client";
import { client } from "./lib/prismic/client";

const app = express();
const port = 3002;
const viewPath = path.join(__dirname, "..", "views");

function linkResolver(doc) {
  if (doc.type === "project") {
    return `/details/${doc.slug}`;
  }
  if (doc.type === "projects") {
    return `/zones`;
  }
  if (doc.type === "about") {
    return `/about`;
  }
  if (doc.type === "") return "/";
}

/* fetchers */
const fetchMeta = () => client.getSingle("meta");

const fetchProjectByUID = (uid, params = {}) =>
  client.getByUID("project", uid, params);

const fetchAllProjectCategory = (params = {}) =>
  client.getAllByType("project_category", params);

const fetchWithPredicates = (predicates) => {
  return client.get({ predicates });
};

const fetchHome = () => client.getSingle("home");

const fetchPreloader = () => client.getSingle("preloader");

const fetchNav = () => client.getSingle("navigation");

/* utils */
const getProjectCategoryOfTheProject = (project) =>
  project.data.project_category;

app.use((req, res, next) => {
  res.locals.Link = linkResolver;
  res.locals.ctx = {
    prismicH,
  };
  res.locals.Numbers = (index) => {
    return index == 0
      ? "One"
      : index == 1
      ? "Two"
      : index == 2
      ? "Three"
      : index == 3
      ? "Four"
      : "";
  };
  next();
});

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(errorHandler());
app.set("views", viewPath);
app.set("view engine", "pug");

app.get("/", async (req, res) => {
  const [meta, home, preloader, projectCategories, navigation] =
    await Promise.all([
      fetchMeta(),
      fetchHome(),
      fetchPreloader(),
      fetchAllProjectCategory({ fetchLinks: "project.image" }),
      fetchNav(),
    ]);

  console.log("navigation : ", navigation.data.list[0].text);
  res.render("pages/home", {
    meta,
    home,
    projectCategories,
    preloader,
    navigation,
  });
});

app.get("/about", async (req, res) => {
  const response = await fetchWithPredicates(
    prismic.predicates.any("document.type", ["about", "meta"])
  );
  const preloader = await fetchPreloader();
  const { about, meta } = response.results.reduce(
    (acc, doc) => (acc[doc.type] = doc) && acc,
    {}
  );
  const navigation = await fetchNav();
  res.render("pages/about", { about, meta, preloader, navigation });
});

app.get("/zones", async (req, res) => {
  const [meta, home, preloader, projectCategories, navigation] =
    await Promise.all([
      fetchMeta(),
      fetchHome(),
      fetchPreloader(),
      fetchAllProjectCategory({ fetchLinks: "project.image" }),
      fetchNav(),
    ]);

  console.log(
    "projectCategories[0]: ",
    projectCategories[0].data.projects[0].project.data
  );

  console.log("home: ", home);

  res.render("pages/zones", {
    meta,
    home,
    projectCategories,
    preloader,
    navigation,
  });
});

app.get("/details/:uid", async (req, res) => {
  console.log("DEBUG request");
  const uid = req.params.uid;
  const fetchProjectByUIDParams = {
    fetchLinks: "project_category.title",
  };

  const [meta, preloader, project, navigation] = await Promise.all([
    fetchMeta(),
    fetchPreloader(),
    fetchProjectByUID(uid, fetchProjectByUIDParams),
    fetchNav(),
  ]);
  // console.log("project.data: ", project.data);
  res.render("pages/details", { meta, project, preloader, navigation });
});

app.listen(port, () => {
  console.log("debug `viewPath`: ", viewPath);
  console.log("App listening on port " + port + ".");
});
