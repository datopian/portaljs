import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';

/**
 * Displays a list of blog posts with the title and a short excerp from the content. 
 * @param {object} props 
 * {
 *  posts: {
 *    title: <The title of the blog post>
 *    excerpt: <A short excerpt from the post content>
 *   }
 * } 
 * @returns 
 */
const PostList = ({ posts }) => {
  return (
    <>
      {posts.map((post, index) => (
        <div key={index}>
          <a
            href={`/blog/${post.slug}`}
            className="text-2xl font-semibold text-primary my-6 inline-block"
          >
            {parse(post.title)}
          </a>
          <p>{parse(post.excerpt)}</p>
        </div>
      ))}
    </>
  );
};

PostList.propTypes = {
  posts: PropTypes.object.isRequired
}

export default PostList;
