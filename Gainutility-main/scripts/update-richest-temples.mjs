import fs from 'fs';

// 1. Update page.tsx
const pagePath = 'C:/Users/nav/Downloads/testing/sacred-places-india/src/app/richest-temples-in-india/page.tsx';
const pageContent = `import { constructMetadata, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo";
import RichestTemplesContent from "./RichestTemplesContent";
import Schema from "@/components/Schema";

export const metadata = constructMetadata({
  title: "Richest Temples in India: Reported Assets & Revenue Measures",
  description: "Analysis of temple wealth in India, distinguishing consecrated treasury gold, annual hundi donations, disclosed trust assets, and operating budgets.",
  canonicalPath: "/richest-temples-in-india",
  keywords: [
    "richest temples in india",
    "richest temple in india",
    "wealthiest temples in india",
    "padmanabhaswamy temple treasure",
    "tirupati balaji net worth",
    "shirdi temple assets",
    "temple hundi collections",
    "temple wealth measurement"
  ]
});

const richestFaqs = [
  {
    question: "What does 'richest temple' mean in India?",
    answer: "There is no single financial measure for temple wealth. Reported figures fall into four distinct categories: 1) Consecrated subterranean vault treasure (e.g. Sree Padmanabhaswamy Temple), 2) Disclosed statutory trust balance sheets and land holdings (e.g. Tirumala Tirupati Devasthanams), 3) Annual devotee hundi (offering box) cash collections, and 4) Annual operational budgets. These metrics cannot be directly combined into one linear ranking."
  },
  {
    question: "Which temple has the largest reported treasure in India?",
    answer: "Sree Padmanabhaswamy Temple in Thiruvananthapuram, Kerala, holds the largest documented sacred treasury. The 2011 Supreme Court-monitored inventory of Vaults A, C, D, E, and F uncovered antique gold statues, gemstones, ceremonial crowns, and coins with informal valuation estimates exceeding ₹1.2 lakh crore ($22 billion). These are consecrated deity antiquities and are not liquid commercial assets."
  },
  {
    question: "Which temple has the largest disclosed operational trust net worth?",
    answer: "Tirumala Tirupati Devasthanams (TTD) in Andhra Pradesh has the largest declared institutional net worth. In its official audited White Paper, TTD declared assets exceeding ₹2.26 lakh crore, including over 10.25 tonnes of gold deposited in nationalized banks, ₹16,000+ crore in bank fixed deposits, and 7,123 acres of land across 960 property parcels."
  },
  {
    question: "Is Harmandir Sahib (the Golden Temple) considered a Hindu temple?",
    answer: "No. Sri Harmandir Sahib in Amritsar, Punjab, is the supreme spiritual center of Sikhism and is administered by the Shiromani Gurdwara Parbandhak Committee (SGPC). While frequently cited in popular wealth discussions due to its gilded sanctum and massive daily community kitchen (langar), it is a Sikh Gurdwara, not a Hindu temple."
  }
];

export default function RichestTemplesPage() {
  const breadcrumbs = [
    { name: "Home", item: "/" },
    { name: "Richest Temples in India", item: "/richest-temples-in-india" }
  ];

  return (
    <>
      <Schema data={generateBreadcrumbSchema(breadcrumbs)} />
      <Schema data={generateFAQSchema(richestFaqs)} />
      <RichestTemplesContent />
    </>
  );
}
`;
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated richest-temples-in-india/page.tsx');

// 2. Update RichestTemplesContent.tsx
const contentPath = 'C:/Users/nav/Downloads/testing/sacred-places-india/src/app/richest-temples-in-india/RichestTemplesContent.tsx';
const contentCode = `import React from "react";
import Link from "next/link";
import { 
  Coins, 
  Landmark, 
  Info, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  FileText, 
  ChevronRight, 
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  Scale
} from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

interface FinancialMeasureGroup {
  title: string;
  metricType: string;
  description: string;
  institutions: {
    name: string;
    location: string;
    slug: string;
    reportedFigure: string;
    asOf: string;
    natureOfAsset: string;
    summary: string;
    image: string;
  }[];
}

const financialGroups: FinancialMeasureGroup[] = [
  {
    title: "Category 1: Consecrated Subterranean Vault Treasure",
    metricType: "Ancient Antiquities & Consecrated Gold Reserves",
    description: "Centuries of royal and devotee offerings stored in consecrated vaults. These are unmonetized deity antiquities under strict judicial protection, not commercial or liquid operating assets.",
    institutions: [
      {
        name: "Sree Padmanabhaswamy Temple",
        location: "Thiruvananthapuram, Kerala",
        slug: "padmanabhaswamy-temple",
        reportedFigure: "Estimated ₹1.2 Lakh Crore (~$22 Billion)",
        asOf: "Supreme Court Inventory (2011)",
        natureOfAsset: "Antique gold statues, crowns, diamond ropes, ancient Roman and Venetian gold coins stored across underground vaults.",
        summary: "In 2011, a seven-member committee appointed by the Supreme Court of India inventoried underground vaults (Kallaras) A, C, D, E, and F, revealing centuries of accumulated royal endowments from the Travancore Maharajas. Vault B remains uncatalogued. The Supreme Court affirmed that the treasure belongs strictly to the deity and cannot be commercialized.",
        image: "/images/temples/padmanabhaswamy-temple.jpg"
      }
    ]
  },
  {
    title: "Category 2: Audited Public Trust Net Worth & Disclosed Assets",
    metricType: "Declared Bank Deposits, Physical Gold in Banks & Land Parcels",
    description: "Statutory public religious trusts that publish audited white papers, balance sheets, and formal land registries with government oversight.",
    institutions: [
      {
        name: "Tirumala Venkateswara Temple (TTD)",
        location: "Tirupati, Andhra Pradesh",
        slug: "tirumala-venkateswara-temple",
        reportedFigure: "₹2.26 Lakh Crore Net Worth (~$27+ Billion)",
        asOf: "TTD Audited White Paper (Nov 2022 / 2024)",
        natureOfAsset: "10.25+ tonnes of pure gold deposited in nationalized banks, ₹16,000+ crore in fixed deposits, and 7,123 acres of land across 960 parcels.",
        summary: "Administered by the Tirumala Tirupati Devasthanams (TTD) under statutory Andhra Pradesh legislation, Tirumala publishes comprehensive audited balance sheets. Its assets include temple jewellery, extensive bank fixed deposits earning over ₹1,200 crore annually in interest, and widespread agricultural and urban real estate endowments.",
        image: "/images/temples/tirumala-venkateswara-temple.jpg"
      },
      {
        name: "Shri Saibaba Sansthan Trust",
        location: "Shirdi, Maharashtra",
        slug: "shirdi-sai-baba-temple",
        reportedFigure: "₹2,500+ Crore Bank Deposits & Investments",
        asOf: "Annual Public Trust Audit (2023–2024)",
        natureOfAsset: "Bank fixed deposits, physical gold ornaments (including a 94-kg gold throne), silver offerings, and medical/educational infrastructure.",
        summary: "The Shirdi trust operates under the Bombay Public Trusts Act, supervised by a government-appointed management committee. Devotee contributions fund extensive philanthropic services, including two charitable multi-speciality hospitals, subsidized dining halls (prasadalaya) serving over 50,000 visitors daily, and water supply infrastructure.",
        image: "/images/temples/shirdi-sai-baba-temple.jpg"
      }
    ]
  },
  {
    title: "Category 3: Annual Devotee Hundi Donations & Operating Revenue",
    metricType: "Yearly Cash Inflows, Ticket Revenue & Ritual Offerings",
    description: "The volume of new liquid cash and gold received directly through hundi (offering boxes) and booking revenue during each financial year.",
    institutions: [
      {
        name: "Tirumala Venkateswara Temple (Annual Budget)",
        location: "Tirupati, Andhra Pradesh",
        slug: "tirumala-venkateswara-temple",
        reportedFigure: "₹5,141 Crore Annual Budget (FY 2024–25)",
        asOf: "TTD Board Budget Estimates (2024)",
        natureOfAsset: "Annual cash hundi collections (~₹1,611 crore), interest on fixed deposits (~₹1,167 crore), laddu prasadam sales (~₹500 crore), and darshan tickets.",
        summary: "Tirumala receives the highest continuous cash offerings in the Hindu world. The hundi collection alone routinely averages ₹3.5 to ₹4.5 crore daily. Annual revenues support temple rituals, employee salaries for 20,000 staff members, Hindu Dharma Prachara Parishad activities, and free Annaprasadam dining for 70,000+ pilgrims daily.",
        image: "/images/temples/tirumala-venkateswara-temple.jpg"
      },
      {
        name: "Shree Siddhivinayak Ganapati Temple Trust",
        location: "Mumbai, Maharashtra",
        slug: "siddhivinayak-temple-mumbai",
        reportedFigure: "₹100–120 Crore Annual Revenue",
        asOf: "Annual Trust Report (2023)",
        natureOfAsset: "Hundi cash offerings, auction of gold jewellery, puja booking fees, and trust investment returns (total fixed assets ~₹1,000 crore).",
        summary: "Located in Prabhadevi, Mumbai, the temple is managed by a state-constituted trust. Annual revenues support cancer treatment programs, dialect centers, and educational scholarships across Maharashtra. The temple receives significant gold offerings from corporate and film industry patrons.",
        image: "/images/temples/siddhivinayak-temple.jpg"
      },
      {
        name: "Shri Mata Vaishno Devi Shrine Board (SMVDSB)",
        location: "Katra, Jammu & Kashmir",
        slug: "vaishno-devi-temple",
        reportedFigure: "₹500+ Crore Annual Income",
        asOf: "Shrine Board Financial Review (2023)",
        natureOfAsset: "Devotee cash donations, helicopter ticketing royalties, guesthouse receipts, and gold/silver offerings.",
        summary: "Created by statutory state enactment in 1986, the Shrine Board governs the pilgrimage to the holy cave shrine. The annual income finances the 13-km track infrastructure, battery car transit, water purification networks, a multi-speciality hospital in Kakryal, and Shri Mata Vaishno Devi University.",
        image: "/images/temples/vaishno-devi-temple.jpg"
      }
    ]
  },
  {
    title: "Category 4: Historic Regional Endowments & Landmark Trusts",
    metricType: "Ancient Land Trusts & Regional Devasthanam Holdings",
    description: "Long-standing regional institutions whose wealth consists primarily of ancient agrarian land endowments and historic deity ornaments.",
    institutions: [
      {
        name: "Shree Jagannath Temple",
        location: "Puri, Odisha",
        slug: "jagannath-puri-temple",
        reportedFigure: "60,000+ Acres Land & Ratna Bhandar Treasury",
        asOf: "Odisha Law Department / Temple Committee (2024)",
        natureOfAsset: "60,426 acres of identified land across Odisha and other states; consecrated gold and diamond jewellery stored in the Ratna Bhandar.",
        summary: "Puri Jagannath Temple's primary wealth resides in extensive agricultural land grants endowed by the Eastern Ganga, Gajapati, and Maratha rulers over eight centuries. In July 2024, the state government conducted an official inspection and inventory of the inner Ratna Bhandar (treasury) for structural inspection and gold cataloguing.",
        image: "/images/temples/jagannath-puri-temple.jpg"
      },
      {
        name: "Meenakshi Sundareswarar Temple",
        location: "Madurai, Tamil Nadu",
        slug: "meenakshi-temple",
        reportedFigure: "Land Grants & Antique Jewellery Endowments",
        asOf: "TN HR&CE Annual Audited Ledger (2023)",
        natureOfAsset: "Ancient diamond and ruby crowns endowed by Nayaka rulers, valuable town properties, and gold vimana coverings.",
        summary: "Governed by the Tamil Nadu HR&CE Department, Meenakshi Temple's wealth is rooted in centuries of royal endowments from Pandyan and Madurai Nayaka rulers, including ceremonial processional vahanas (vehicles) cast in solid gold and thousands of acres of hereditary temple lands.",
        image: "/images/temples/meenakshi-temple.jpg"
      }
    ]
  }
];

export default function RichestTemplesContent() {
  return (
    <div className="bg-bg-primary min-h-screen font-sans transition-colors duration-500 pb-20">
      {/* Breadcrumb Bar */}
      <div className="border-b border-border bg-bg-secondary/40 py-2.5">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-text-muted">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-text-muted/60" />
            <span className="text-text-primary font-medium">Richest Temples in India</span>
          </nav>
        </div>
      </div>

      {/* Compact High-Information Header */}
      <header className="relative bg-bg-secondary border-b border-border overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <Scale className="h-3.5 w-3.5" />
              <span>Financial Data & Wealth Measurement Analysis</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-text-primary mb-4 tracking-tight leading-tight">
              Richest Temples in India: Reported Assets & Revenue Measures
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-6">
              An evidence-based examination of temple wealth in India, examining the essential distinctions between consecrated subterranean treasures, declared public trust net worth, annual devotee offerings, and operating budgets.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-muted">
              <span className="flex items-center gap-1.5 bg-bg-primary px-3 py-1.5 rounded-lg border border-border">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Data Source: <strong className="text-text-primary">Statutory Audits & Court Inventories</strong></span>
              </span>
              <span className="flex items-center gap-1.5 bg-bg-primary px-3 py-1.5 rounded-lg border border-border">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>Financial Metrics: <strong className="text-text-primary">4 Distinct Categories</strong></span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 pt-10 space-y-12 md:space-y-16">
        {/* Short Direct Answer & Mandatory Definition Disclaimer */}
        <section className="bg-bg-secondary p-6 md:p-8 rounded-2xl border border-primary/20 shadow-sm" id="direct-answer">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Info className="h-4 w-4" />
            <span>Short Answer & Accounting Clarification</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary mb-4">
            What Does &quot;Richest Temple&quot; Mean?
          </h2>

          <p className="text-base sm:text-lg font-medium text-text-primary leading-relaxed mb-6">
            There is no single linear ranking of India&apos;s wealthiest temples because religious institutions report financial data using fundamentally different measures. A temple holding immense ancient consecrated vault treasures (such as the estimated ₹1.2 lakh crore gold inventory of Sree Padmanabhaswamy Temple) is financially distinct from a public statutory trust with liquid bank deposits and real estate (such as the ₹2.26 lakh crore declared net worth of Tirumala Tirupati Devasthanams), or an institution with high yearly cash donations (such as Tirumala&apos;s ₹1,600+ crore annual hundi receipts).
          </p>

          {/* Mandatory Warning Callout */}
          <div className="bg-bg-primary p-4 md:p-5 rounded-xl border border-border flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              <strong className="text-text-primary font-semibold">Important Methodology Note:</strong> Reported financial information varies by temple and by year, so these figures should not be treated as a directly comparable ranking. Figures presented below are categorized strictly by measurement type, citing verified statutory audits, official white papers, and judicial committee releases.
            </p>
          </div>
        </section>

        {/* Master Comparison Table by Measurement Type */}
        <section className="scroll-mt-24" id="comparison-table">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary">
              Comparative Measures of Indian Temple Wealth
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Distinguishing subterranean sanctum treasures from liquid trust deposits and yearly donations.
            </p>
          </div>

          <div className="overflow-x-auto bg-bg-secondary rounded-2xl border border-border">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead>
                <tr className="border-b border-border bg-bg-primary/50 text-text-primary font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">Temple / Shrine</th>
                  <th className="p-4">Primary Metric Measured</th>
                  <th className="p-4">Reported Figure</th>
                  <th className="p-4">Source &amp; Date</th>
                  <th className="p-4">Nature of Asset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Sree Padmanabhaswamy Temple</td>
                  <td className="p-4 text-text-muted">Subterranean Vault Treasure</td>
                  <td className="p-4 font-bold text-primary">₹1.2 Lakh Crore (~$22B)</td>
                  <td className="p-4 text-text-muted">Supreme Court Inventory (2011)</td>
                  <td className="p-4">Consecrated deity antiquities; non-liquid.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Tirumala Venkateswara (TTD)</td>
                  <td className="p-4 text-text-muted">Audited Total Trust Net Worth</td>
                  <td className="p-4 font-bold text-primary">₹2.26 Lakh Crore (~$27B)</td>
                  <td className="p-4 text-text-muted">TTD White Paper (2022–2024)</td>
                  <td className="p-4">10.25t gold in banks, ₹16,000cr FDs, 7,123 acres land.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Tirumala Venkateswara (TTD)</td>
                  <td className="p-4 text-text-muted">Annual Operating Budget</td>
                  <td className="p-4 font-bold text-primary">₹5,141 Crore</td>
                  <td className="p-4 text-text-muted">TTD Board Budget (FY 2024–25)</td>
                  <td className="p-4">Hundi cash (~₹1,611cr), interest, and seva fees.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Shirdi Saibaba Sansthan Trust</td>
                  <td className="p-4 text-text-muted">Bank Fixed Deposits &amp; Assets</td>
                  <td className="p-4 font-bold text-primary">₹2,500+ Crore</td>
                  <td className="p-4 text-text-muted">Public Trust Audit (2023–2024)</td>
                  <td className="p-4">Cash deposits, gold/silver reserves, hospitals.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Shree Siddhivinayak Temple Trust</td>
                  <td className="p-4 text-text-muted">Annual Receipts &amp; Liquid Assets</td>
                  <td className="p-4 font-bold text-primary">₹100–120 Crore / year</td>
                  <td className="p-4 text-text-muted">State Trust Audit (2023)</td>
                  <td className="p-4">Devotee cash donations, gold jewellery auctions.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Mata Vaishno Devi Shrine Board</td>
                  <td className="p-4 text-text-muted">Annual Operating Revenue</td>
                  <td className="p-4 font-bold text-primary">₹500+ Crore / year</td>
                  <td className="p-4 text-text-muted">SMVDSB Accounts (2023)</td>
                  <td className="p-4">Pilgrim track maintenance, aviation royalties, stays.</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-text-primary">Puri Jagannath Temple</td>
                  <td className="p-4 text-text-muted">Landed Endowments &amp; Treasury</td>
                  <td className="p-4 font-bold text-primary">60,426 Acres Land</td>
                  <td className="p-4 text-text-muted">Odisha Law Dept (2024)</td>
                  <td className="p-4">Agrarian land grants and Ratna Bhandar ornaments.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Categorized Detailed Breakdown */}
        <section className="space-y-10" id="detailed-breakdown">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary mb-2">
              Detailed Examination by Wealth Metric
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Understanding the historical, legal, and operational background of each temple&apos;s financial structure.
            </p>
          </div>

          {financialGroups.map((group, gIdx) => (
            <div key={gIdx} className="bg-bg-secondary p-6 md:p-8 rounded-2xl border border-border">
              <div className="border-b border-border/70 pb-4 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{group.metricType}</span>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-text-primary mt-1">
                  {group.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  {group.description}
                </p>
              </div>

              <div className="space-y-6">
                {group.institutions.map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-bg-primary p-5 md:p-6 rounded-xl border border-border flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden relative shrink-0 bg-bg-secondary">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        fallbackType="temple"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                          <h4 className="text-lg md:text-xl font-serif font-bold text-text-primary">
                            {item.name}
                          </h4>
                          <span className="text-xs text-text-muted">{item.location}</span>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                          <p className="text-xs font-bold uppercase text-primary">Reported Financial Metric</p>
                          <p className="text-base sm:text-lg font-serif font-bold text-text-primary mt-0.5">{item.reportedFigure}</p>
                          <p className="text-[11px] text-text-muted mt-0.5">Source / Date: {item.asOf}</p>
                        </div>

                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-3">
                          {item.summary}
                        </p>

                        <div className="text-xs text-text-muted border-t border-border/50 pt-2 mb-4">
                          <strong>Asset Nature:</strong> {item.natureOfAsset}
                        </div>
                      </div>

                      <div>
                        <Link
                          href={\`/temple/\${item.slug}\`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Read Complete {item.name} Guide</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Authoritative Sources & Methodology */}
        <section className="bg-bg-secondary/60 p-6 md:p-8 rounded-2xl border border-border" id="sources">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Info className="h-4 w-4" />
            <span>Authoritative Audits &amp; Court Filings</span>
          </div>
          <h2 className="text-lg font-serif font-bold text-text-primary mb-3">
            Primary Financial Sources
          </h2>
          <p className="text-xs text-text-secondary mb-4 leading-relaxed">
            All data cited above is drawn exclusively from statutory disclosures, court-appointed expert panels, and audited balance sheets:
          </p>
          <ul className="space-y-2 text-xs text-text-secondary">
            <li>• <strong>Tirumala Tirupati Devasthanams (TTD):</strong> Official White Paper on Assets and Gold Reserves (Released November 2022, Updated FY 2024–25 Budget).</li>
            <li>• <strong>Supreme Court of India:</strong> Expert Committee Inventory Proceedings on Sree Padmanabhaswamy Temple (Civil Appeal No. 4739 of 2011).</li>
            <li>• <strong>Shri Saibaba Sansthan Trust (Shirdi):</strong> Statutory Audit Reports and Financial Statements (Published under the Maharashtra Public Trusts Act).</li>
            <li>• <strong>Shree Siddhivinayak Ganapati Temple Trust (Prabhadevi, Mumbai):</strong> Annual Audit Statements.</li>
            <li>• <strong>Shri Mata Vaishno Devi Shrine Board (SMVDSB):</strong> Annual Performance and Infrastructure Financial Releases.</li>
          </ul>
        </section>

        {/* Related Internal Guides */}
        <section className="scroll-mt-24" id="related-guides">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary mb-2 flex items-center gap-2">
            <CompassIcon className="h-5 w-5 text-primary" /> Related Research Guides
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Continue exploring data-driven temple documentation and heritage directories.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/how-many-temples-in-india"
              className="bg-bg-secondary p-5 rounded-xl border border-border hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="font-serif font-bold text-text-primary group-hover:text-primary transition-colors text-base mb-1.5">
                  How Many Temples in India?
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Analysis of ASI monuments, 44,000+ state registered shrines, and census data on places of worship.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-border/60 text-xs text-primary font-semibold inline-flex items-center justify-between">
                <span>View Data Breakdown</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/largest-hindu-temple-in-the-world"
              className="bg-bg-secondary p-5 rounded-xl border border-border hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="font-serif font-bold text-text-primary group-hover:text-primary transition-colors text-base mb-1.5">
                  Largest Hindu Temple in the World
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  How architectural scale is measured: campus area vs built-up floor area across Angkor Wat, Srirangam, and Akshardham.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-border/60 text-xs text-primary font-semibold inline-flex items-center justify-between">
                <span>Explore Scale Metrics</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>

            <Link
              href="/oldest-temples-in-india"
              className="bg-bg-secondary p-5 rounded-xl border border-border hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="font-serif font-bold text-text-primary group-hover:text-primary transition-colors text-base mb-1.5">
                  Oldest Temples in India
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Distinguishing oldest surviving stone architecture from ancient continuous worship traditions.
                </p>
              </div>
              <span className="mt-4 pt-3 border-t border-border/60 text-xs text-primary font-semibold inline-flex items-center justify-between">
                <span>Examine Archaeological Evidence</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function CompassIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
`;
fs.writeFileSync(contentPath, contentCode, 'utf8');
console.log('Successfully updated richest-temples-in-india/RichestTemplesContent.tsx');
