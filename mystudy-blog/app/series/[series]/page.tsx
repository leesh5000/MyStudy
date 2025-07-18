import { getPostsBySeries, getAllSeries } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface SeriesDetailPageProps {
  params: {
    series: string;
  };
}

export async function generateStaticParams() {
  const allSeries = getAllSeries();
  return allSeries.map((series) => ({
    series: series.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const seriesName = params.series.replace(/-/g, ' ');
  const allSeries = getAllSeries();
  
  const series = allSeries.find(
    (s) => s.name.toLowerCase() === seriesName.toLowerCase()
  );

  if (!series) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/series"
        className="inline-flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-8"
      >
        <ArrowLeft size={16} />
        <span>시리즈 목록으로</span>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {series.name} 시리즈
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          총 {series.posts.length}개의 포스트
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: SeriesDetailPageProps) {
  const seriesName = params.series.replace(/-/g, ' ');
  
  return {
    title: `${seriesName} 시리즈 | MyStudy Blog`,
    description: `${seriesName} 시리즈의 모든 포스트`,
  };
}