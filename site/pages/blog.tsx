import Layout from "@/components/Layout";
import computeFields from "@/lib/computeFields";
import clientPromise from "@/lib/mddb";
import { BlogsList, SimpleLayout } from "@portaljs/core";
import * as fs from "fs";
import { NextSeo } from "next-seo";
import { H1, H2 } from "@/components/custom/header";
export default function Blog({ blogs }) {
  return (
    <>
      <NextSeo
        title="Blog"
        description="Explore the latest updates, tutorials, and insights about PortalJS. Stay informed and enhance your skills."
      />
      <Layout>
        <H1 className="mx-auto text-center">
          Blog Posts
        </H1>
        <H2 sub={true} className="my-2 text-center">
          Discover insights, updates and stories
        </H2>
        <div className="sm:-mt-16">
          <SimpleLayout>
            <BlogsList blogs={blogs} />
          </SimpleLayout>
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const mddb = await clientPromise;
  let blogs = await mddb.getFiles({
    folder: "blog",
    extensions: ["md", "mdx"],
  });

  //  Temporary, while MarkdownDB doesn't support filetypes
  //  Merges docs that have the "blog" filetype
  let docs = await mddb.getFiles({
    folder: "docs",
    extensions: ["md", "mdx"],
  });

  docs = docs.filter((doc) => doc.metadata.filetype === "blog");

  blogs = [...blogs, ...docs];

  const blogsWithComputedFields = blogs.map(async (blog) => {
    const source = fs.readFileSync(blog.file_path, { encoding: "utf-8" });

    return await computeFields({
      frontMatter: blog.metadata,
      urlPath: blog.url_path,
      filePath: blog.file_path,
      source,
    });
  });

  const blogList = await Promise.all(blogsWithComputedFields);

  const blogsSorted = blogList.sort(
    (a, b) => new Date(b?.date).getTime() - new Date(a?.date).getTime()
  );

  return {
    props: {
      blogs: blogsSorted,
    },
  };
}
