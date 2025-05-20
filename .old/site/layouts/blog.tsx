import { Avatar } from "@/components/Avatar";
import { formatDate } from "@/lib/formatDate";

export const BlogLayout: React.FC<any> = ({ children, ...frontMatter }) => {
  const { title, date, authorsDetails } = frontMatter;
  return (
    <article className="prose mx-auto prose-a:text-primary dark:prose-a:text-primary-dark prose-strong:text-primary dark:prose-strong:text-primary-dark prose-headings:text-primary dark:prose-headings:text-primary-dark text-primary dark:text-primary-dark prose-headings:font-headings dark:prose-invert prose-a:break-words">
      <header>
        <div className="mb-4 flex-col items-center">
          {title && <h1 className="flex justify-center">{title}</h1>}
          {date && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 flex justify-center">
              <time dateTime={date}>{formatDate(date)}</time>
            </p>
          )}
          {authorsDetails && (
            <div className="flex flex-wrap not-prose items-center space-x-6 space-y-3 justify-center">
              {authorsDetails.map(({ name, avatar, isDraft, url_path }) => (
                <Avatar
                  key={url_path || name}
                  name={name}
                  img={avatar}
                  href={url_path && !isDraft ? `/${url_path}` : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </header>
      <section>{children}</section>
    </article>
  );
};