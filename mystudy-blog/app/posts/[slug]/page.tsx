import { getPostBySlug, getAllPosts } from '@/lib/posts';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function PostPage({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const categoryColors = {
    development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    series: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    til: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ai: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  };

  const categoryLabels = {
    development: '개발',
    series: '시리즈',
    til: 'TIL',
    ai: 'AI',
  };

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/posts"
        className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-8"
      >
        <ArrowLeft size={16} />
        <span>목록으로 돌아가기</span>
      </Link>

      <header className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[post.category]}`}>
            {categoryLabels[post.category]}
          </span>
          {post.series && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {post.series} #{post.seriesOrder}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {post.title}
        </h1>

        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Calendar size={16} />
            <span>{new Date(post.date).toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{post.readingTime}</span>
          </div>
        </div>
      </header>

      <div className="prose-container">
        <MarkdownRenderer content={post.content} />
      </div>

      {post.series && (
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/series/${post.series.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {post.series} 시리즈의 다른 글 보기 →
          </Link>
        </div>
      )}
    </article>
  );
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} | MyStudy Blog`,
    description: post.excerpt,
  };
}