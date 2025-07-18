import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Post, PostMeta } from './types';
import readingTime from 'reading-time';

const contentDirectory = path.join(process.cwd(), 'content');

function getPostSlug(filePath: string, category: string): string {
  const fileName = path.basename(filePath, '.md');
  if (category === 'series') {
    const seriesName = path.dirname(filePath).split(path.sep).pop() || '';
    return `${seriesName}-${fileName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  return fileName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function extractMetaFromFileName(fileName: string, category: string): Partial<PostMeta> {
  const meta: Partial<PostMeta> = {};
  
  // TIL 파일 처리 (예: 2025.05.15_TIL.md)
  if (category === 'til') {
    const dateMatch = fileName.match(/(\d{4})\.(\d{2})\.(\d{2})/);
    if (dateMatch) {
      meta.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
      meta.title = `TIL - ${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;
    }
  }
  
  // Series 파일 처리 (예: ElasticSearch 1 : 개요.md)
  if (category === 'series') {
    const seriesMatch = fileName.match(/(.+?)\s+(\d+)\s*:\s*(.+)/);
    if (seriesMatch) {
      meta.series = seriesMatch[1];
      meta.seriesOrder = parseInt(seriesMatch[2]);
      meta.title = `${seriesMatch[1]} ${seriesMatch[2]} : ${seriesMatch[3]}`;
    }
  }
  
  // 일반 파일 처리
  if (!meta.title) {
    meta.title = fileName.replace(/[-_]/g, ' ').replace(/\.md$/, '');
  }
  
  return meta;
}

function getAllPostFiles(dir: string, category: string, fileList: { path: string; category: string }[] = []): { path: string; category: string }[] {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllPostFiles(filePath, category, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push({ path: filePath, category });
    }
  });
  
  return fileList;
}

export function getAllPosts(): Post[] {
  const categories = [
    { name: 'development', path: 'Development' },
    { name: 'series', path: 'Series' },
    { name: 'til', path: 'TIL' },
    { name: 'ai', path: 'AI' }
  ];
  
  const allPosts: Post[] = [];
  
  categories.forEach(({ name, path: categoryPath }) => {
    const categoryDir = path.join(contentDirectory, categoryPath);
    if (fs.existsSync(categoryDir)) {
      const files = getAllPostFiles(categoryDir, name);
      
      files.forEach(({ path: filePath, category }) => {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContents);
        
        const fileName = path.basename(filePath);
        const fileMeta = extractMetaFromFileName(fileName, category);
        
        const post: Post = {
          slug: getPostSlug(filePath, category),
          title: data.title || fileMeta.title || fileName,
          content,
          date: data.date || fileMeta.date || new Date().toISOString().split('T')[0],
          category: category as Post['category'],
          series: data.series || fileMeta.series,
          seriesOrder: data.seriesOrder || fileMeta.seriesOrder,
          readingTime: readingTime(content).text,
          excerpt: content.slice(0, 200).replace(/[#\n]/g, ' ').trim() + '...'
        };
        
        allPosts.push(post);
      });
    }
  });
  
  // 날짜별로 정렬 (최신순)
  return allPosts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

export function getPostBySlug(slug: string): Post | null {
  const allPosts = getAllPosts();
  return allPosts.find(post => post.slug === slug) || null;
}

export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.category === category);
}

export function getPostsBySeries(seriesName: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts
    .filter(post => post.series === seriesName)
    .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
}

export function getAllSeries(): { name: string; posts: Post[] }[] {
  const allPosts = getAllPosts();
  const seriesMap = new Map<string, Post[]>();
  
  allPosts.forEach(post => {
    if (post.series) {
      if (!seriesMap.has(post.series)) {
        seriesMap.set(post.series, []);
      }
      seriesMap.get(post.series)?.push(post);
    }
  });
  
  return Array.from(seriesMap.entries()).map(([name, posts]) => ({
    name,
    posts: posts.sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
  }));
}