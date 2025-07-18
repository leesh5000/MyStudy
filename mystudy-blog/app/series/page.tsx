import Link from 'next/link';
import { getAllSeries } from '@/lib/posts';
import { BookOpen, ChevronRight } from 'lucide-react';

export default function SeriesPage() {
  const allSeries = getAllSeries();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">시리즈</h1>

      {allSeries.length > 0 ? (
        <div className="grid gap-6">
          {allSeries.map((series) => (
            <div
              key={series.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <BookOpen className="text-purple-600 dark:text-purple-400" size={24} />
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {series.name}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    총 {series.posts.length}개의 포스트
                  </p>

                  <div className="space-y-2">
                    {series.posts.slice(0, 3).map((post, index) => (
                      <Link
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {index + 1}.
                        </span>
                        <span className="text-sm">{post.title}</span>
                      </Link>
                    ))}
                    {series.posts.length > 3 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        외 {series.posts.length - 3}개 더...
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/series/${series.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 ml-4"
                >
                  <span>전체 보기</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">아직 시리즈가 없습니다.</p>
        </div>
      )}
    </div>
  );
}