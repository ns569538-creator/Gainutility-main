import fs from 'fs';

const filePath = 'C:/Users/nav/Downloads/testing/sacred-places-india/src/lib/data/world/countries.ts';
let content = fs.readFileSync(filePath, 'utf8');

const usaStart = content.indexOf('export const usa: WorldCountry = {');
const ukStart = content.indexOf('export const uk: WorldCountry = {');

if (usaStart === -1 || ukStart === -1) {
  console.error('Could not find USA boundaries in countries.ts');
  process.exit(1);
}

const updatedUsa = `export const usa: WorldCountry = {
  id: "usa",
  slug: "usa",
  name: "United States",
  flag: "🇺🇸",
  image: "https://upload.wikimedia.org/wikipedia/commons/a/a4/BAPS_Akshardham_North_America.jpg",
  backupImage: "https://upload.wikimedia.org/wikipedia/commons/4/4a/BAPS_Shri_Swaminarayan_Mandir_Hindu_Temple_Outdoor_photo.JPG",
  altText: "BAPS Swaminarayan Akshardham in Robbinsville, New Jersey, the largest traditional Hindu temple complex in the USA",
  templeCount: 5,
  seoTitle: "Hindu Temples in the USA: Locations, Count & Directory | Sacred Places India",
  seoDescription: "How many Hindu temples are in the USA? Evidence-based analysis of the estimated 450–600+ purpose-built mandirs, major sites like Akshardham NJ, and regional temple directories.",
  h1: "Hindu Temples in the USA",
  description: "An evidence-based directory and research guide to Hindu temples across the United States, from landmark hand-carved stone mandirs to regional community centers.",
  introduction: "The United States is home to an estimated 3.3 million Hindus, representing one of the largest Hindu diaspora populations in the world. Hindu worship spaces across America span traditional hand-carved stone mandirs built according to ancient Shilpa Shastra canons, elaborate Dravidian-style shrines with multi-tiered gopurams, and hundreds of community-managed cultural sanctuaries.",
  history: "Hindu immigration to the United States grew significantly following the passage of the Immigration and Nationality Act of 1965, which abolished national-origin quotas. Early congregations gathered in university lounges, rented halls, and residential properties before securing permanent spaces. The Sri Venkateswara Temple in Penn Hills near Pittsburgh (consecrated in 1976) and the Hindu Temple Society of North America in Flushing, Queens (1977) established the earliest traditional purpose-built temple structures in the country. Subsequent decades witnessed monumental stone mandir construction, culminating in the October 2023 inauguration of the BAPS Swaminarayan Akshardham in Robbinsville, New Jersey.",
  pilgrimageImportance: "Major American temples serve as vital spiritual anchors and cultural hubs for multi-generational communities. Landmarks such as BAPS Akshardham New Jersey, Sri Venkateswara Temple Pittsburgh, and the Malibu Hindu Temple draw devotees from across North America during festivals such as Diwali, Janmashtami, Maha Shivaratri, and Navaratri.",
  architectureOverview: "American Hindu temples reflect both classical Indian architectural schools and contemporary adaptations. The BAPS Akshardham in Robbinsville exemplifies the traditional Nagaradi architectural style, constructed from hand-carved Italian Carrara marble and Indian pink sandstone without structural steel. South Indian Dravidian architecture is prominently represented by temples in Pittsburgh, Flushing, and Lemont (Illinois), featuring authentic rajagopurams, pillared mandapas, and consecrated granite sanctums.",
  travelInfo: "Most major US temples are situated in suburban areas accessible via interstate highways, with ample dedicated parking. BAPS Akshardham in Robbinsville is situated off the New Jersey Turnpike (Exit 7A), approximately 60 miles from New York City and 45 miles from Philadelphia. Pittsburgh's Sri Venkateswara Temple is accessible from the Penn-Lincoln Parkway. Check official temple websites for darshan passes and prayer schedules.",
  bestTimeToVisit: "Temples are open year-round with daily aarti and darshan schedules. Major festivals including Diwali (October/November), Krishna Janmashtami (August/September), and Navaratri draw peak crowds. Visiting during weekday mornings offers a contemplative, uncrowded experience.",
  countSection: {
    heading: "How Many Hindu Temples Are There in the USA?",
    shortAnswer: "The United States Census does not record religious affiliation or track places of worship by law (Public Law 94-521). Based on religious census research from the Association of Religion Data Archives (ARDA) and directory mapping by the Harvard University Pluralism Project, there are an estimated 450 to 600+ traditional purpose-built Hindu mandirs across the United States, and over 1,000 Hindu worship spaces when community halls and cultural centers are included.",
    methodology: "Places of worship in the United States operate as independent 501(c)(3) non-profit entities registered under individual state laws rather than a single national religious board. Authoritative nationwide estimates rely on academic surveys from the Harvard Pluralism Project, the U.S. Religion Census (Association of Statisticians of American Religious Bodies), and umbrella diaspora registries.",
    facts: [
      {
        label: "Purpose-Built Mandirs",
        value: "450–600+",
        detail: "Traditional shikhabaddha stone and structural temples across US states"
      },
      {
        label: "Total Worship Spaces",
        value: "1,000+",
        detail: "Including community mandirs, cultural centers, and fellowship halls"
      },
      {
        label: "US Hindu Population",
        value: "~3.3M",
        detail: "Pew Research Center demographic estimate (~1.0% of US population)"
      },
      {
        label: "Largest Complex",
        value: "183 Acres",
        detail: "BAPS Swaminarayan Akshardham campus in Robbinsville, New Jersey (2023)"
      }
    ]
  },
  regionalBreakdown: [
    {
      region: "Northeast (New York, New Jersey, Pennsylvania)",
      summary: "Hosts the highest concentration of traditional Hindu stone mandirs in North America.",
      notableTemples: [
        { name: "BAPS Swaminarayan Akshardham", location: "Robbinsville, New Jersey", slug: "baps-swaminarayan-akshardham" },
        { name: "Sri Venkateswara Temple", location: "Penn Hills (Pittsburgh), Pennsylvania", slug: "sri-venkateswara-temple" },
        { name: "Vishnu Devi Mandir", location: "Richmond Hill, Queens, New York", slug: "vishnu-devi-mandir" },
        { name: "Hindu Temple Society of North America (Ganesh Temple)", location: "Flushing, Queens, New York" }
      ]
    },
    {
      region: "West Coast (California, Washington)",
      summary: "A historic center of American Hindu heritage dating back to late 19th-century Vedanta societies, now featuring landmark Dravidian and Nagara stone complexes.",
      notableTemples: [
        { name: "Malibu Hindu Temple", location: "Calabasas, California", slug: "malibu-hindu-temple" },
        { name: "BAPS Shri Swaminarayan Mandir", location: "Chino Hills, California", slug: "shri-swaminarayan-mandir" },
        { name: "Shiva-Vishnu Temple", location: "Livermore, California" }
      ]
    },
    {
      region: "South & Texas (Houston, Dallas, Atlanta)",
      summary: "One of the fastest-growing Hindu population centers in the USA, featuring massive stone and Dravidian complexes.",
      notableTemples: [
        { name: "BAPS Shri Swaminarayan Mandir", location: "Stafford (Houston), Texas" },
        { name: "BAPS Shri Swaminarayan Mandir", location: "Lilburn (Atlanta), Georgia" },
        { name: "Sri Meenakshi Temple", location: "Pearland, Texas" }
      ]
    },
    {
      region: "Midwest (Illinois, Ohio, Michigan)",
      summary: "Long-standing temple institutions serving multi-generational communities across the Great Lakes.",
      notableTemples: [
        { name: "The Hindu Temple of Greater Chicago", location: "Lemont, Illinois" },
        { name: "BAPS Shri Swaminarayan Mandir", location: "Bartlett, Illinois" },
        { name: "Sri Venkateswara Swami Temple of Greater Chicago", location: "Aurora, Illinois" }
      ]
    }
  ],
  sourcesList: [
    {
      title: "The Pluralism Project Directory of Religious Centers",
      institution: "Harvard University",
      year: "2024",
      note: "Academic mapping project documenting American Hindu places of worship."
    },
    {
      title: "U.S. Religion Census: Religious Congregations and Membership Study",
      institution: "Association of Statisticians of American Religious Bodies (ASARB) / ARDA",
      year: "2020",
      note: "Decennial count of American religious congregations and adherents."
    },
    {
      title: "Religious Landscape Study: Hindus in the U.S.",
      institution: "Pew Research Center",
      year: "2023",
      note: "Demographic data on religious self-identification and community statistics."
    },
    {
      title: "BAPS Swaminarayan Akshardham Official Archive",
      institution: "BAPS Swaminarayan Sanstha",
      year: "2023",
      note: "Robbinsville temple construction facts, architectural specifications, and inauguration records."
    }
  ],
  relatedPages: [
    {
      title: "BAPS Swaminarayan Akshardham (New Jersey)",
      href: "/world-hindu-temples/usa/baps-swaminarayan-akshardham",
      description: "Complete guide to the largest Hindu temple complex in the United States, located in Robbinsville, New Jersey."
    },
    {
      title: "Sri Venkateswara Temple (Pittsburgh)",
      href: "/world-hindu-temples/usa/sri-venkateswara-temple",
      description: "One of the earliest traditional Hindu temples in North America, modelled after Tirupati Balaji."
    },
    {
      title: "Malibu Hindu Temple (California)",
      href: "/world-hindu-temples/usa/malibu-hindu-temple",
      description: "Traditional South Indian Dravidian temple dedicated to Lord Venkateswara in the Santa Monica Mountains."
    },
    {
      title: "Largest Hindu Temple in the World",
      href: "/largest-hindu-temple-in-the-world",
      description: "Comparative architectural analysis of Angkor Wat, Srirangam, Akshardham Delhi, and Akshardham Robbinsville."
    },
    {
      title: "How Many Temples Are There in India?",
      href: "/how-many-temples-in-india",
      description: "An evidence-based analysis of ASI monuments, 44,000+ state registered temples, and census data."
    }
  ],
  faqs: [
    {
      question: "How many Hindu temples are there in the United States?",
      answer: "There are an estimated 450 to 600+ traditional purpose-built Hindu mandirs in the USA, and more than 1,000 Hindu worship spaces when including community halls and cultural centers. California, New York, New Jersey, and Texas have the largest numbers of temples."
    },
    {
      question: "What is the largest Hindu temple in the USA?",
      answer: "BAPS Swaminarayan Akshardham in Robbinsville, New Jersey, is the largest Hindu temple in the United States. Spanning a 183-acre campus with a central shrine standing 191 feet tall, it was hand-carved from marble and limestone and inaugurated in October 2023."
    },
    {
      question: "What was the first Hindu temple built in the USA?",
      answer: "The Sri Venkateswara Temple in Penn Hills near Pittsburgh, Pennsylvania (consecrated in November 1976) and the Hindu Temple Society of North America in Flushing, Queens, New York (July 1977) were the earliest traditional purpose-built Hindu temples in the United States."
    },
    {
      question: "Are American Hindu temples open to visitors of all backgrounds?",
      answer: "Yes, Hindu temples in the United States welcome visitors of all faiths. Modest dress covering shoulders and knees and the removal of footwear before entering the prayer hall are standard requirements."
    }
  ],
  coordinates: { lat: 37.0902, lng: -95.7129 },
  region: "North America",
  capital: "Washington, D.C.",
  language: "English",
  currency: "US Dollar (USD)",
};`;

content = content.slice(0, usaStart) + updatedUsa + '\n\n' + content.slice(ukStart);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated USA data in countries.ts');
