export default function DefaultLayout({ children, ...frontMatter }) {
  return (
    <div className="prose mx-auto prose-a:text-primary dark:prose-a:text-primary-dark prose-strong:text-primary dark:prose-strong:text-primary-dark prose-headings:text-primary dark:prose-headings:text-primary-dark text-primary dark:text-primary-dark prose-headings:font-headings dark:prose-invert prose-a:break-words">
      <header>
        <div className="mb-6">
          {/* Default layout */}
          {!frontMatter.layout && (
            <>
              {!frontMatter.disableTitle && <h1>{frontMatter.title}</h1>}
              {frontMatter.author && (
                <div className="-mt-6">
                  <p className="opacity-60 pl-1">{frontMatter.author}</p>
                </div>
              )}
              {frontMatter.description && (
                <p className="description">{frontMatter.description}</p>
              )}
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
