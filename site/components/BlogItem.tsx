import { Card } from "@/components/Card";
import { formatDate } from "@/lib/common";
export function BlogItem({ blog }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`${blog.url_path}`}>{blog.title}</Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={blog.created}
          className="md:hidden"
          decorate
        >
          {formatDate(blog.created)}
        </Card.Eyebrow>
        {blog.description && (
          <Card.Description>{blog.description}</Card.Description>
        )}
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={blog.created}
        className="mt-1 hidden md:block"
      >
        {formatDate(blog.created)}
      </Card.Eyebrow>
    </article>
  );
}
