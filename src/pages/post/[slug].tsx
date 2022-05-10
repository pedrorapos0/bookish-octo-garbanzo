/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();
  if (isFallback) {
    return <h1 className={styles.loadPost}>Carregando...</h1>;
  }
  return (
    <main className={styles.postContainer}>
      <img src={post.data.banner.url} alt="banner" />
      <h1>{post.data.title}</h1>
      <div className={styles.info}>
        <div className={styles.createAt}>
          <img src="/calendar.svg" alt="create At" />
          <time>
            {format(new Date(post.first_publication_date), 'dd LLL yyyy', {
              locale: ptBR,
            })}
          </time>
        </div>
        <div className={styles.author}>
          <img src="/user.svg" alt="author" />
          <span>{post.data.author}</span>
        </div>
        <div className={styles.readingTime}>
          <img src="/clock.svg" alt="reading time" />
          <span>{`${Math.ceil(
            post.data.content.reduce((sum, { body }) => {
              sum += RichText.asText(body).split(' ').length;
              return sum;
            }, 0) / 200
          )} min`}</span>
        </div>
      </div>
      {post.data.content.map(({ body, heading }) => (
        <article className={styles.postContent} key={heading}>
          <h2>{heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
        </article>
      ))}
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('publish');
  return {
    paths: posts.results.map(post => {
      return {
        params: {
          slug: post.uid,
        },
      };
    }),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('publish', String(slug));
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };
  return {
    props: {
      post,
    },
  };
};
