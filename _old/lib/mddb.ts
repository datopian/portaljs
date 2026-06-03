import { MarkdownDB } from "mddb";
// import config from "./markdowndb.config.js";

// TODO get this path from markdowndb.config.js or something
const dbPath = "markdown.db";
//
// if (!config.dbPath)
//   throw new Error("Invalid/Missing path in markdowndb.config.js");
// }
//
// const dbPath = config.dbPath;
// OR
// const dbOptions = config.dbOptions;

const client = new MarkdownDB({
  client: "sqlite3",
  connection: {
    filename: dbPath,
  },
});

const clientPromise = client.init();

export default clientPromise;
