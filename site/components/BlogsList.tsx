import { BlogItem } from "@/components/BlogItem.jsx";
import { useState } from "react";

const BLOGS_LOAD_COUNT = 10;

export function BlogsList({ blogs }) {
  const [blogsCount, setBlogsCount] = useState(BLOGS_LOAD_COUNT);

  const handleLoadMore = () => {
    setBlogsCount((prevCount) => prevCount + BLOGS_LOAD_COUNT);
  };

  return (
    <section role="feed">
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex flex-col space-y-16">
          {blogs.slice(0, blogsCount).map((blog) => {
            return <BlogItem key={blog.url_path} blog={blog} />;
          })}
        </div>
      </div>
      {blogs.length > blogsCount && (
        <div className="text-center pt-20">
          <button
            onClick={handleLoadMore}
            type="button"
            className="inline-flex items-center rounded border border-gray-300 px-2.5 py-1.5 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-50/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Show more
          </button>
        </div>
      )}
    </section>
  );
}
