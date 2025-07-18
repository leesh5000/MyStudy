import Link from 'next/link';
import { Post } from '@/lib/types';
import { Calendar, Clock, BookOpen } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
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
    <Link href={`/posts/${post.slug}`}>
      <article className="group h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[post.category]}`}>
              {categoryLabels[post.category]}
            </span>
            {post.series && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.series} #{post.seriesOrder}
              </span>
            )}
          </div>
          
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{new Date(post.date).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}