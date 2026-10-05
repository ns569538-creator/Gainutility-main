import { BLOG_ARTICLES } from '../src/blog/blogData';
import fs from 'fs';

const subset = BLOG_ARTICLES.slice(0, 5);
fs.writeFileSync('scratch/articles-1-5.json', JSON.stringify(subset, null, 2));
console.log('Saved articles 1-5');
