import { format, parseISO } from 'date-fns'
import Head from 'next/head'
import Link from 'next/link'

export default function BlogPost(blog) {
  return (
    <>
      <Head>
        <title>{blog.title}</title>
      </Head>
      <article className='container mt-20'>
        <div className="mb-15">

          <h2 className="text-3xl mb-3 text-center">
            <Link href={`blog/${blog.slug}`}>
              <a className="text-gray-700 decoration-transparent">{blog.title}</a>
            </Link>
          </h2>

          <section className='grid grid-col-12'>
            <div className='col-start-2 flex mb-3'>
              <p className='text-gray-500 mr-1'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </p>
              <time dateTime={blog.date} className="text-sm text-gray-500">
                {format(parseISO(blog.date), 'LLLL d, yyyy')}
              </time>
              <div className='ml-4 -mt-1'>
                {
                  blog.authors.map((author, i) => (
                    <span key={i} className="text-sm text-orange-400">
                      {author}{i < blog.authors.length - 1 ? ', ' : ''}
                    </span>
                  ))
                }
              </div>

            </div>
          </section>

        </div>
        <hr className="my-6" />
        <div className="prose mx-auto">
          <main>
            <div dangerouslySetInnerHTML={{ __html: blog.body.html }} />
          </main>
        </div>
      </article>
    </>
  )
}