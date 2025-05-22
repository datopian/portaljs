import { writeFileSync } from "fs";
import { allDocuments } from "../.contentlayer/generated/index.mjs";

const omit = (obj = {}, keys = []) => {
  const result = Object.assign({}, obj);
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

const coreContent = allDocuments
  .map((doc) =>
    omit(
      {
        ...doc,
        sourceDir:
          doc._raw.sourceFileDir === "." ? null : doc._raw.sourceFileDir,
      },
      ["body", "_raw", "_id"]
    )
  )
  .filter((doc) => !doc.isDraft);

writeFileSync("public/search.json", JSON.stringify(coreContent));
