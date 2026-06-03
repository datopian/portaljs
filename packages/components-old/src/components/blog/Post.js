import React from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';

/**
 * Displays a blog post page
 * @param {object} props 
 * post = {
 *  title: <The title of the blog post>
 *  content: <The body of the blog post. Can be plain text or html>
 *  createdAt: <The utc date when the post was last modified>.
 *  featuredImage: <Url/relative url to post cover image>
 * }
 * @returns 
 */
const Post = ({ post }) => {
  const { title, content, createdAt, featuredImage } = post;

  return (
    <>
      <h1 className="text-3xl font-semibold text-primary my-6 inline-block">
        {title}
      </h1>
      <p className="mb-6">Posted: {createdAt}</p>
      <img src={featuredImage} className="mb-6" alt="featured_img" />
      <div>{parse(content)}</div>
    </>
  );
};


Post.propTypes = {
  page: PropTypes.shape({
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.number,
    featuredImage: PropTypes.string,
  })
}

export default Post;
