import fs from 'fs';

const filePath = 'C:/Users/nav/Downloads/testing/sacred-places-india/src/app/mysterious-temples-in-india/MysteriousTemplesContent.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add ChevronRight to imports if not present
if (!content.includes('ChevronRight')) {
  content = content.replace(
    'import { Sparkles,',
    'import { ChevronRight, Sparkles,'
  );
}

// Find min-h-[70vh] and replace the hero section
const heroStart = content.indexOf('{/* Hero Section */}');
const heroEnd = content.indexOf('{/* Mystery Categories Overview */}');

if (heroStart !== -1 && heroEnd !== -1) {
  const newHeroContent = `{/* Breadcrumb Bar */}
      <div className="border-b border-border bg-bg-secondary/40 py-2.5">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-text-muted/60" />
            <span className="text-text-primary font-medium">Mysterious Temples in India</span>
          </nav>
        </div>
      </div>

      {/* Compact High-Information Header */}
      <section className="relative min-h-[35vh] md:min-h-[42vh] flex items-center justify-center overflow-hidden bg-[#0A0C10] transition-all duration-500 border-b border-border py-12 md:py-16">
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src="https://upload.wikimedia.org/wikipedia/commons/3/37/Chariot_Temple%2C_Hampi.jpg"
            alt="Vittala Temple stone chariot, a well-known symbol of India's mysterious temples"
            className="w-full h-full object-cover opacity-35 scale-105"
            fallbackType="temple"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-bg-primary" />
        </div>

        <div className="container relative z-10 text-center px-5 max-w-5xl mx-auto">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-4 py-1 text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase backdrop-blur-md">
            Architectural &amp; Scientific Investigation
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 tracking-tight leading-[1.15] break-words">
            Mysterious Temples in India:<br />
            <span className="text-primary italic">12 Sites That Defy Explanation</span>
          </h1>
          <p className="max-w-[70ch] mx-auto text-gray-300 font-light text-sm md:text-lg leading-relaxed text-balance transition-colors duration-300">
            Hanging pillars, musical columns, eternal flames, and secret vaults. A researched guide to 12 of India&apos;s most enigmatic temples — examining the phenomena, the history, and the science.
          </p>
        </div>
      </section>

      `;

  content = content.slice(0, heroStart) + newHeroContent + content.slice(heroEnd);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated MysteriousTemplesContent.tsx with index-based replacement');
} else {
  console.error('Could not find heroStart or heroEnd');
}
