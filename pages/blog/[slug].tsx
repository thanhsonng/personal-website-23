import type { InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import ErrorPage from 'next/error';
import Head from 'next/head';
import Container from 'components/container';
import { formatDate } from 'lib/time';
import { getAllPosts, getPostBySlug } from 'lib/getPost';
import markdownToHtml from 'lib/markdownToHtml';

export default function PostPage({
  post,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <Container>
      <Head>
        {/**
         * Beware of "title has more than 1 children" error
         * @see https://github.com/vercel/next.js/discussions/38256
         */}
        <title>{`${post.title} @ Son Nguyen • Blog`}</title>
      </Head>

      {router.isFallback ? (
        <div>Loading…</div>
      ) : (
        <div>
          <article>
            <header>
              <h1 className="text-4xl font-bold">{post.title}</h1>
              {post.excerpt ? (
                <p className="mt-2 text-xl">{post.excerpt}</p>
              ) : null}
              <time className="flex mt-2 text-gray-400">
                {formatDate(post.date ? new Date(post.date) : new Date())}
              </time>
            </header>

            <div
              className="prose dark:prose-invert prose-a:decoration-gray-300 prose-a:break-words prose-img:rounded mt-10 max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      )}
    </Container>
  );
}

type Params = {
  params: {
    slug: string
  }
}

export async function getStaticProps({ params }: Params) {
  const post = getPostBySlug(params.slug, [
    'slug',
    'title',
    'excerpt',
    'date',
    'content',
  ]);
  const content = await markdownToHtml(post.content || '');

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  };
}

export async function getStaticPaths() {
  const posts = getAllPosts(['slug']);

  return {
    paths: posts.map(({ slug }) => {
      return {
        params: {
          slug,
        },
      };
    }),
    fallback: false,
  };
}
