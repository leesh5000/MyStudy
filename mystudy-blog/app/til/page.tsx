import { getPostsByCategory } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import { Calendar } from 'lucide-react';

export default function TILPage() {
  const tilPosts = getPostsByCategory('til');
  
  // 월별로 그룹핑
  const postsByMonth = tilPosts.reduce((acc, post) => {
    const date = new Date(post.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(post);
    
    return acc;
  }, {} as Record<string, typeof tilPosts>);

  const sortedMonths = Object.keys(postsByMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Today I Learned</h1>
      
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        매일 배운 내용을 기록하고 정리합니다. 작은 것이라도 꾸준히 기록하는 것이 목표입니다.
      </p>

      {sortedMonths.length > 0 ? (
        <div className="space-y-12">
          {sortedMonths.map((monthKey) => {
            const [year, month] = monthKey.split('-');
            const monthPosts = postsByMonth[monthKey];
            
            return (
              <div key={monthKey}>
                <div className="flex items-center space-x-2 mb-6">
                  <Calendar className="text-green-600 dark:text-green-400" size={24} />
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {year}년 {parseInt(month)}월
                  </h2>
                  <span className="text-gray-500 dark:text-gray-400">
                    ({monthPosts.length}개)
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {monthPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">아직 TIL이 없습니다.</p>
        </div>
      )}
    </div>
  );
}