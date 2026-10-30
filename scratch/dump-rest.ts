import { BLOG_ARTICLES } from '../src/blog/blogData';
import fs from 'fs';

fs.writeFileSync('scratch/articles-6-12.json', JSON.stringify(BLOG_ARTICLES.slice(5, 12), null, 2));
fs.writeFileSync('scratch/articles-13-16.json', JSON.stringify(BLOG_ARTICLES.slice(12, 16), null, 2));
fs.writeFileSync('scratch/articles-17-20.json', JSON.stringify(BLOG_ARTICLES.slice(16, 20), null, 2));
console.log('Saved all article dumps');
