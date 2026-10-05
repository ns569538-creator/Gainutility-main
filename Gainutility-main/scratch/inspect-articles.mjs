import { BLOG_ARTICLES } from '../src/blog/blogData.ts';

for (let i = 0; i < BLOG_ARTICLES.length; i++) {
  const a = BLOG_ARTICLES[i];
  console.log(`=== [${i+1}] ${a.slug} (${a.category}) ===`);
  console.log('Title:', a.title);
  console.log('ReadingTime:', a.readingTime);
  console.log('QuickAnswer:', a.quickAnswer ? a.quickAnswer.slice(0, 60) + '...' : '(none)');
  console.log('KeyTakeaway:', a.keyTakeaway ? a.keyTakeaway.slice(0, 60) + '...' : '(none)');
  console.log('ToolCTA:', a.toolCta ? a.toolCta.label : '(none)');
  console.log('Headings:', a.content.map(b => b.heading).filter(Boolean));
  console.log('Blocks count:', a.content.length);
  console.log('');
}
