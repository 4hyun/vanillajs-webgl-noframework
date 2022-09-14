// node-fetch is used to make network requests to the Prismic Rest API.
// In Node.js Prismic projects, you must provide a fetch method to the
// Prismic client.
import fetch from "node-fetch";
import * as prismic from "@prismicio/client";

const accessToken = process.env.PRISMIC_PERMANENT_ACCESS_TOKEN;

// The `routes` property is your Route Resolver. It defines how you will
// structure URLs in your project. Update the types to match the Custom
// Types in your project, and edit the paths to match the routing in your
// project.
const routes = [
  {
    type: "about",
    path: "/:uid",
  },
];

export const client = prismic.createClient("brainblast-webgl-landing", {
  fetch,
  accessToken,
  // routes,
});
