import Link from 'next/link';
import { Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 MyStudy Blog. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              개발 공부를 하면서 작성한 글들을 모아놓은 저장소입니다.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              aria-label="GitHub"
            >
              <Github size={20} />
            </Link>
            <Link
              href="mailto:example@email.com"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              aria-label="Email"
            >
              <Mail size={20} />
            </Link>
            <Link
              href="https://helloc.tistory.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Tistory Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}