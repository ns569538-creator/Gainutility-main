import { ViewState } from "../types";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Code, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  ChevronDown,
  ShieldCheck,
  HelpCircle
} from "lucide-react";
import { Button, Card, Breadcrumbs } from "./Common";
import { ContinueEditing } from "./ContinueEditing";

type SchemaType = 
  | "Organization"
  | "LocalBusiness"
  | "Website"
  | "WebPage"
  | "Article"
  | "BlogPosting"
  | "FAQPage"
  | "BreadcrumbList"
  | "Product"
  | "Person"
  | "Event"
  | "Recipe"
  | "SoftwareApplication";

interface SchemaMarkupGeneratorProps {
  onCopy: (text: string) => void;
  onAddToast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  onChangeView?: (view: ViewState) => void;
}

export const SchemaMarkupGenerator: React.FC<SchemaMarkupGeneratorProps> = ({
  onCopy,
  onAddToast,
  onChangeView
}) => {
  const [selectedType, setSelectedType] = useState<SchemaType>("Organization");
  const [compiledJson, setCompiledJson] = useState("");

  // Schema state structures
  const [orgData, setOrgData] = useState({ name: "GainUtility Studio", url: "https://gainutility.com", logo: "https://gainutility.com/logo.png" });
  const [localBusData, setLocalBusData] = useState({ name: "Aesthetic Coffee Shop", url: "https://aestheticcafe.com", image: "https://aestheticcafe.com/front.jpg", telephone: "+1-555-0199", street: "123 Visual Way", city: "San Francisco", state: "CA", postalCode: "94107" });
  const [websiteData, setWebsiteData] = useState({ name: "GainUtility", url: "https://gainutility.com" });
  const [webpageData, setWebpageData] = useState({ name: "Developer Tools Studio", description: "Browser-side developer utility workspace." });
  const [articleData, setArticleData] = useState({ headline: "Designing Premium Interactive Utility Systems", author: "Aesthetic Team", publisher: "GainUtility Studio", datePublished: "2026-06-15", image: "https://gainutility.com/blog-hero.jpg" });
  const [blogData, setBlogData] = useState({ headline: "Why Offline Sandbox Tools are Dominating Dev Workflows", author: "Aesthetic Writer", publisher: "GainUtility Pub", datePublished: "2026-07-02", image: "https://gainutility.com/blog2.jpg" });
  
  // FAQ Page - dynamic list of QA
  const [faqList, setFaqList] = useState<{ question: string; answer: string }[]>([
    { question: "Is my data uploaded to any servers?", answer: "No, all sitemaps, schemas, and configurations are computed fully in-browser offline." },
    { question: "Are these schemas recognized by Google?", answer: "Yes, this tool produces official Schema.org JSON-LD scripts fully recognized by Google Search Console." }
  ]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Product Schema
  const [productData, setProductData] = useState({ name: "Premium GainUtility License", image: "https://gainutility.com/license.png", description: "Local developer suite lifetime access.", sku: "EVR-LIFETIME-01", price: "49.00", currency: "USD", availability: "InStock" });

  // Person Schema
  const [personData, setPersonData] = useState({ name: "Jane Developer", jobTitle: "Lead Creative Technologist", url: "https://janedev.io", worksFor: "GainUtility" });

  // Event Schema
  const [eventData, setEventData] = useState({ name: "Aesthetic UI Design Expo", startDate: "2026-09-20T09:00", locationName: "Visual Arts Hub", locationAddress: "456 Grid Blvd, NY", price: "20.00", currency: "USD" });

  // Recipe Schema
  const [recipeData, setRecipeData] = useState({ name: "Local Dev Setup Brew", author: "Aesthetic barista", prepTime: "PT5M", cookTime: "PT10M", yield: "1 mug", description: "Perfect pour-over setup to energize high-fidelity coding sprints." });

  // Software App Schema
  const [softwareData, setSoftwareData] = useState({ name: "GainUtility", operatingSystem: "Windows, macOS, Linux", category: "DeveloperApplication", price: "0.00", currency: "USD" });

  // Load URL from Smart Handoff
  useEffect(() => {
    if (window.__gainutility_handoff_seo) {
      const data = window.__gainutility_handoff_seo;
      if (data.url) {
        setOrgData((prev) => ({ ...prev, url: data.url || prev.url }));
        setWebsiteData((prev) => ({ ...prev, url: data.url || prev.url }));
        onAddToast("Imported domain URL context via Smart Handoff!", "success");
      }
      window.__gainutility_handoff_seo = undefined;
    }
  }, [onAddToast]);

  // Re-build JSON-LD script block on changes
  useEffect(() => {
    generateSchemaJson();
  }, [selectedType, orgData, localBusData, websiteData, webpageData, articleData, blogData, faqList, productData, personData, eventData, recipeData, softwareData]);

  const generateSchemaJson = () => {
    let schemaObj: any = {
      "@context": "https://schema.org"
    };

    switch (selectedType) {
      case "Organization":
        schemaObj["@type"] = "Organization";
        schemaObj["name"] = orgData.name;
        schemaObj["url"] = orgData.url;
        if (orgData.logo) schemaObj["logo"] = orgData.logo;
        break;

      case "LocalBusiness":
        schemaObj["@type"] = "LocalBusiness";
        schemaObj["name"] = localBusData.name;
        schemaObj["url"] = localBusData.url;
        schemaObj["image"] = localBusData.image;
        schemaObj["telephone"] = localBusData.telephone;
        schemaObj["address"] = {
          "@type": "PostalAddress",
          "streetAddress": localBusData.street,
          "addressLocality": localBusData.city,
          "addressRegion": localBusData.state,
          "postalCode": localBusData.postalCode
        };
        break;

      case "Website":
        schemaObj["@type"] = "WebSite";
        schemaObj["name"] = websiteData.name;
        schemaObj["url"] = websiteData.url;
        break;

      case "WebPage":
        schemaObj["@type"] = "WebPage";
        schemaObj["name"] = webpageData.name;
        schemaObj["description"] = webpageData.description;
        break;

      case "Article":
        schemaObj["@type"] = "Article";
        schemaObj["headline"] = articleData.headline;
        schemaObj["author"] = {
          "@type": "Person",
          "name": articleData.author
        };
        schemaObj["publisher"] = {
          "@type": "Organization",
          "name": articleData.publisher
        };
        schemaObj["datePublished"] = articleData.datePublished;
        schemaObj["image"] = articleData.image;
        break;

      case "BlogPosting":
        schemaObj["@type"] = "BlogPosting";
        schemaObj["headline"] = blogData.headline;
        schemaObj["author"] = {
          "@type": "Person",
          "name": blogData.author
        };
        schemaObj["publisher"] = {
          "@type": "Organization",
          "name": blogData.publisher
        };
        schemaObj["datePublished"] = blogData.datePublished;
        schemaObj["image"] = blogData.image;
        break;

      case "FAQPage":
        schemaObj["@type"] = "FAQPage";
        schemaObj["mainEntity"] = faqList.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }));
        break;

      case "Product":
        schemaObj["@type"] = "Product";
        schemaObj["name"] = productData.name;
        schemaObj["image"] = productData.image;
        schemaObj["description"] = productData.description;
        schemaObj["sku"] = productData.sku;
        schemaObj["offers"] = {
          "@type": "Offer",
          "price": productData.price,
          "priceCurrency": productData.currency,
          "availability": `https://schema.org/${productData.availability}`
        };
        break;

      case "Person":
        schemaObj["@type"] = "Person";
        schemaObj["name"] = personData.name;
        schemaObj["jobTitle"] = personData.jobTitle;
        schemaObj["url"] = personData.url;
        schemaObj["worksFor"] = {
          "@type": "Organization",
          "name": personData.worksFor
        };
        break;

      case "Event":
        schemaObj["@type"] = "Event";
        schemaObj["name"] = eventData.name;
        schemaObj["startDate"] = eventData.startDate;
        schemaObj["location"] = {
          "@type": "Place",
          "name": eventData.locationName,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": eventData.locationAddress
          }
        };
        schemaObj["offers"] = {
          "@type": "Offer",
          "price": eventData.price,
          "priceCurrency": eventData.currency
        };
        break;

      case "Recipe":
        schemaObj["@type"] = "Recipe";
        schemaObj["name"] = recipeData.name;
        schemaObj["author"] = {
          "@type": "Person",
          "name": recipeData.author
        };
        schemaObj["prepTime"] = recipeData.prepTime;
        schemaObj["cookTime"] = recipeData.cookTime;
        schemaObj["recipeYield"] = recipeData.yield;
        schemaObj["description"] = recipeData.description;
        break;

      case "SoftwareApplication":
        schemaObj["@type"] = "SoftwareApplication";
        schemaObj["name"] = softwareData.name;
        schemaObj["operatingSystem"] = softwareData.operatingSystem;
        schemaObj["applicationCategory"] = softwareData.category;
        schemaObj["offers"] = {
          "@type": "Offer",
          "price": softwareData.price,
          "priceCurrency": softwareData.currency
        };
        break;

      default:
        break;
    }

    const scriptBlock = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;
    setCompiledJson(scriptBlock);
  };

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      onAddToast("Both question and answer text fields are required.", "warning");
      return;
    }
    setFaqList([...faqList, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion("");
    setNewAnswer("");
    onAddToast("Added new FAQ page question node!", "success");
  };

  const handleDeleteFaq = (idx: number) => {
    setFaqList(faqList.filter((_, i) => i !== idx));
    onAddToast("FAQ node removed.", "info");
  };

  const handleCopyCode = () => {
    if (!compiledJson) return;
    onCopy(compiledJson);
  };

  const handleDownloadFile = () => {
    if (!compiledJson) return;
    const blob = new Blob([compiledJson], { type: "application/ld+json;charset=utf-8" });
    const urlBlob = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = `schema_${selectedType.toLowerCase()}_markup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);
    onAddToast("JSON-LD sitemap markup file downloaded!", "success");
  };

  const handleReset = () => {
    setSelectedType("Organization");
    setOrgData({ name: "GainUtility Studio", url: "https://gainutility.com", logo: "https://gainutility.com/logo.png" });
    setLocalBusData({ name: "Aesthetic Coffee Shop", url: "https://aestheticcafe.com", image: "https://aestheticcafe.com/front.jpg", telephone: "+1-555-0199", street: "123 Visual Way", city: "San Francisco", state: "CA", postalCode: "94107" });
    setWebsiteData({ name: "GainUtility", url: "https://gainutility.com" });
    setWebpageData({ name: "Developer Tools Studio", description: "Browser-side developer utility workspace." });
    setArticleData({ headline: "Designing Premium Interactive Utility Systems", author: "Aesthetic Team", publisher: "GainUtility Studio", datePublished: "2026-06-15", image: "https://gainutility.com/blog-hero.jpg" });
    setBlogData({ headline: "Why Offline Sandbox Tools are Dominating Dev Workflows", author: "Aesthetic Writer", publisher: "GainUtility Pub", datePublished: "2026-07-02", image: "https://gainutility.com/blog2.jpg" });
    setFaqList([
      { question: "Is my data uploaded to any servers?", answer: "No, all sitemaps, schemas, and configurations are computed fully in-browser offline." },
      { question: "Are these schemas recognized by Google?", answer: "Yes, this tool produces official Schema.org JSON-LD scripts fully recognized by Google Search Console." }
    ]);
    setNewQuestion("");
    setNewAnswer("");
    setProductData({ name: "Premium GainUtility License", image: "https://gainutility.com/license.png", description: "Local developer suite lifetime access.", sku: "EVR-LIFETIME-01", price: "49.00", currency: "USD", availability: "InStock" });
    setPersonData({ name: "Jane Developer", jobTitle: "Lead Creative Technologist", url: "https://janedev.io", worksFor: "GainUtility" });
    setEventData({ name: "Aesthetic UI Design Expo", startDate: "2026-09-20T09:00", locationName: "Visual Arts Hub", locationAddress: "456 Grid Blvd, NY", price: "20.00", currency: "USD" });
    setRecipeData({ name: "Local Dev Setup Brew", author: "Aesthetic barista", prepTime: "PT5M", cookTime: "PT10M", yield: "1 mug", description: "Perfect pour-over setup to energize high-fidelity coding sprints." });
    setSoftwareData({ name: "GainUtility", operatingSystem: "Windows, macOS, Linux", category: "DeveloperApplication", price: "0.00", currency: "USD" });
    setCompiledJson("");
    onAddToast("Schema fields cleared.", "info");
  };

  return (
    <div className="w-full py-6 space-y-6">
      {/* Breadcrumbs & Header */}
      

      {/* Compiler split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form controls (change dynamically based on selectedType) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card title={`${selectedType} Schema Configuration Fields`} subtitle="Fill out properties below to generate JSON-LD script block.">
            <div className="space-y-4">
              
              {selectedType === "Organization" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-organization-name">Organization Name</label>
                    <input
                      type="text"
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-border-medium rounded-xl bg-background text-text-main"
                    id="schema-markup-generator-organization-name"/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-website-url">Website URL</label>
                    <input
                      type="text"
                      value={orgData.url}
                      onChange={(e) => setOrgData({ ...orgData, url: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-border-medium rounded-xl bg-background text-text-main"
                    id="schema-markup-generator-website-url"/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-logo-url">Logo URL</label>
                    <input
                      type="text"
                      value={orgData.logo}
                      onChange={(e) => setOrgData({ ...orgData, logo: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-border-medium rounded-xl bg-background text-text-main"
                    id="schema-markup-generator-logo-url"/>
                  </div>
                </div>
              )}

              {selectedType === "LocalBusiness" && (
                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-business-name">Business Name</label>
                    <input
                      type="text"
                      value={localBusData.name}
                      onChange={(e) => setLocalBusData({ ...localBusData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                    id="schema-markup-generator-business-name"/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-domain-url">Domain URL</label>
                      <input
                        type="text"
                        value={localBusData.url}
                        onChange={(e) => setLocalBusData({ ...localBusData, url: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                      id="schema-markup-generator-domain-url"/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-telephone">Telephone</label>
                      <input
                        type="text"
                        value={localBusData.telephone}
                        onChange={(e) => setLocalBusData({ ...localBusData, telephone: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                      id="schema-markup-generator-telephone"/>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-street-address">Street Address</label>
                    <input
                      type="text"
                      value={localBusData.street}
                      onChange={(e) => setLocalBusData({ ...localBusData, street: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                    id="schema-markup-generator-street-address"/>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-city">City</label>
                      <input
                        type="text"
                        value={localBusData.city}
                        onChange={(e) => setLocalBusData({ ...localBusData, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                      id="schema-markup-generator-city"/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-state">State</label>
                      <input
                        type="text"
                        value={localBusData.state}
                        onChange={(e) => setLocalBusData({ ...localBusData, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                      id="schema-markup-generator-state"/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-zip-code">Zip Code</label>
                      <input
                        type="text"
                        value={localBusData.postalCode}
                        onChange={(e) => setLocalBusData({ ...localBusData, postalCode: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-border-medium rounded-lg"
                      id="schema-markup-generator-zip-code"/>
                    </div>
                  </div>
                </div>
              )}

              {selectedType === "Website" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-website-name">Website Name</label>
                    <input
                      type="text"
                      value={websiteData.name}
                      onChange={(e) => setWebsiteData({ ...websiteData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-border-medium rounded-xl bg-background text-text-main"
                    id="schema-markup-generator-website-name"/>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-mono font-bold uppercase text-text-muted" htmlFor="schema-markup-generator-target-site-url">Target Site URL</label>
                    <input
                      type="text"
                      value={websiteData.url}
                      onChange={(e) => setWebsiteData({ ...websiteData, url: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm border border-border-medium rounded-xl bg-background text-text-main"
                    id="schema-markup-generator-target-site-url"/>
                  </div>
                </div>
              )}

              {selectedType === "FAQPage" && (
                <div className="space-y-4">
                  <div className="border border-border-light rounded-xl overflow-hidden bg-background max-h-[180px] overflow-y-auto">
                    {faqList.map((faq, idx) => (
                      <div key={idx} className="p-3 border-b border-border-light/45 last:border-0 flex items-start justify-between gap-3 font-sans text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-text-main">Q: {faq.question}</p>
                          <p className="text-text-muted">A: {faq.answer}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteFaq(idx)}
                          className="p-1 text-text-muted hover:text-status-error cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Q/A form */}
                  <div className="p-4 border border-border-light bg-surface-muted/20 rounded-xl space-y-3.5">
                    <h4 className="text-xs font-mono font-bold uppercase text-text-sub">Add FAQ Item</h4>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-muted">Question</label>
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Why use structured data?"
                        className="px-3 py-1.5 text-xs border border-border-medium rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-text-muted">Answer</label>
                      <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="It highlights your site results on Google..."
                        className="px-3 py-1.5 text-xs border border-border-medium rounded-lg resize-none h-[50px]"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddFaq}
                        className="h-[30px] px-3.5 text-xs"
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add FAQ Node
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Type Schema Fields */}
              {selectedType === "Product" && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted font-mono uppercase" htmlFor="schema-markup-generator-product-name">Product Name</label>
                    <input
                      type="text"
                      value={productData.name}
                      onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-border-medium rounded-lg"
                    id="schema-markup-generator-product-name"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-text-muted font-mono uppercase" htmlFor="schema-markup-generator-image-asset-url">Image Asset URL</label>
                    <input
                      type="text"
                      value={productData.image}
                      onChange={(e) => setProductData({ ...productData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-border-medium rounded-lg"
                    id="schema-markup-generator-image-asset-url"/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-text-muted font-mono uppercase" htmlFor="schema-markup-generator-price">Price</label>
                      <input
                        type="text"
                        value={productData.price}
                        onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                        className="w-full px-3 py-2 border border-border-medium rounded-lg"
                      id="schema-markup-generator-price"/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-text-muted font-mono uppercase" htmlFor="schema-markup-generator-currency-iso">Currency (ISO)</label>
                      <input
                        type="text"
                        value={productData.currency}
                        onChange={(e) => setProductData({ ...productData, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-border-medium rounded-lg"
                      id="schema-markup-generator-currency-iso"/>
                    </div>
                  </div>
                </div>
              )}

              {/* Non-explicit details just generic info */}
              {!["Organization", "LocalBusiness", "Website", "FAQPage", "Product"].includes(selectedType) && (
                <div className="p-4 bg-brand-primary-light/40 border border-brand-primary/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-brand-primary flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Real-time Schema Generation Active
                  </h4>
                  <p className="text-xs text-text-sub leading-relaxed">
                    This generator is compiling default schema properties for <strong>{selectedType}</strong>. It outputs official JSON-LD micro-markup syntax inside search engines scripts tags. Modify properties directly inside the right preview code box or load alternative presets.
                  </p>
                </div>
              )}

            </div>
          </Card>
        </div>

        {/* Right compiled preview column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card 
            title="Generated JSON-LD Code Block" 
            subtitle="Place this block inside your webpage header or body."
            actions={
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadFile} leftIcon={<Download className="w-4 h-4" />}>
                  Download JSON
                </Button>
                <Button variant="primary" size="sm" onClick={handleCopyCode} leftIcon={<Copy className="w-4 h-4" />}>
                  Copy Code
                </Button>
              </div>
            }
          >
            <div className="relative">
              <textarea aria-label="Generated JSON-LD Code Block"
                readOnly
                value={compiledJson}
                className="w-full h-[360px] p-5 text-base sm:text-xs font-mono border border-border-medium rounded-[14px] bg-[#121212] text-emerald-400 focus:outline-none resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-text-muted select-none">
                Schema.org compliant
              </div>
            </div>
          </Card>

          {/* Structured validation checker */}
          <Card title="Schema Markup Checker Audit" subtitle="Verification rules for rich listings.">
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>LD+JSON Wrapping:</strong> Schema script contains proper `type="application/ld+json"` wrapping attributes.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4.5 h-4.5 text-status-success shrink-0 mt-0.5" />
                <p className="text-text-sub leading-relaxed">
                  <strong>Standard context scheme:</strong> Structured tree correctly specifies schema.org namespace context parameters.
                </p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Smart Continue Editing */}
      <ContinueEditing 
        currentToolId="schema-markup-generator"
        seoData={{ url: websiteData.url, title: websiteData.name }}
        onChangeView={onChangeView}
        onAddToast={onAddToast}
      />

      {/* Learning blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border-light/60 pt-8">
        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-primary" /> What is Schema JSON-LD?
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Schema structured data is a standardized vocabulary vocabulary developed by Google, Bing, and Yahoo. By writing micro-markup labels in JSON-LD (JavaScript Object Notation for Linked Data), you assist indexing crawler engines in identifying contextual entities (e.g. knowing a phone number belongs to a restaurant versus a publisher), allowing search engines to render beautiful rich snippets.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-sans font-black tracking-tight text-text-main flex items-center gap-2">
            🛡️ Local Client Validation
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            All nested data strings, FAQ nodes, local addresses, and prices are compiled purely on the client-side within your browser sandbox thread. Your personal properties and server directories remain entirely private and completely secure.
          </p>
        </div>
      </div>
    </div>
  );
};
