import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/posts';
import { ArrowRight, BookOpen, Code, Lightbulb } from 'lucide-react';

export default function Home() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 6);
  
  const categories = [
    {
      title: 'Development',
      description: '개발 관련 학습 내용',
      icon: Code,
      href: '/posts?category=development',
      color: 'blue'
    },
    {
      title: 'Series',
      description: '시리즈로 정리한 학습 내용',
      icon: BookOpen,
      href: '/series',
      color: 'purple'
    },
    {
      title: 'TIL',
      description: '매일 배운 내용 기록',
      icon: Lightbulb,
      href: '/til',
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MyStudy Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            개발 공부를 하면서 배운 내용들을 정리하고 기록하는 공간입니다.
            함께 성장하는 개발자가 되기 위한 여정을 기록합니다.
          </p>
          <Link href="/posts" className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            <span>전체 글 보기</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">카테고리</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.title} href={category.href}>
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`text-${category.color}-600 dark:text-${category.color}-400`} size={24} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">최근 포스트</h2>
            <Link href="/posts" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center space-x-1">
              <span>모든 글 보기</span>
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}