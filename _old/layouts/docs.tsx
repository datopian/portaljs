/* eslint import/no-default-export: off */
import { formatDate } from "@/lib/formatDate";

// TODO types
export const DocsLayout: React.FC<any> = ({ children, ...frontMatter }) => {
  const { title, created } = frontMatter;
  return (
    <article className="docs prose prose-a:text-primary dark:prose-a:text-primary-dark prose-strong:text-primary dark:prose-strong:text-primary-dark dark:prose-code:text-primary-dark prose-headings:text-primary dark:prose-headings:text-primary-dark text-primary dark:text-primary-dark dark:prose-invert prose-headings:font-headings prose-a:break-words mx-auto">
      <header>
        <div className="mb-6">
          {created && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              <time dateTime={created}>{formatDate(created)}</time>
            </p>
          )}
          {!frontMatter.disableTitle && title && <h1>{title}</h1>}
        </div>
      </header>
      <section>{children}</section>
    </article>
  );
};
