import { siteConfig } from "config/siteConfig";
import clientPromise from "lib/mddb";

export const getAuthorsDetails = async (authors: string[]) => {
  const mddb = await clientPromise;
  const allPeople = await mddb.getFiles({ folder: "people" });

  //  Temporary, flowershow UI component expects contentlayer obj props
  const allPeopleMetadata = allPeople.map((p) => p.metadata);

  let blogAuthors = [];

  if (authors) {
    blogAuthors = authors;
  } else if (siteConfig.defaultAuthor) {
    blogAuthors = [siteConfig.defaultAuthor];
  }

  return blogAuthors.map((author) => {
    const person = allPeopleMetadata.find(
      ({ id, name }) => id === author || name === author
    );

    return person ?? { name: author, avatar: siteConfig.avatarPlaceholder };
  });
};
