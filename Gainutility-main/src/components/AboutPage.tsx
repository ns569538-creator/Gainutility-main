/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ViewState } from "../types";
import { Breadcrumbs } from "./Common";
import { useLocale } from "../i18n/LocaleContext";
import { pageText } from "../i18n/pages";
import { t } from "../i18n/ui";
import { publicPathForView } from "../router";
import {
  Timer,
  Feather,
  Shield,
  RefreshCw,
  ArrowRight,
  Calendar,
  Layers
} from "lucide-react";

interface AboutPageProps {
  onChangeView: (view: ViewState) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onChangeView }) => {
  const locale = useLocale();

  const bullets = [
    "about.bullet1",
    "about.bullet2",
    "about.bullet3",
    "about.bullet4",
    "about.bullet5",
    "about.bullet6",
  ] as const;

  const values = [
    { key: "value1", icon: <Timer className="about-value-icon-svg" /> },
    { key: "value2", icon: <Feather className="about-value-icon-svg" /> },
    { key: "value3", icon: <Shield className="about-value-icon-svg" /> },
    { key: "value4", icon: <RefreshCw className="about-value-icon-svg" /> },
  ] as const;

  return (
    <article className="about-page animate-fade-in" itemScope itemType="https://schema.org/AboutPage">
      {/* 1. TOPBAR: Breadcrumbs + last-updated metadata */}
      <header className="about-topbar">
        <Breadcrumbs
          paths={[
            {
              name: t("crumbsHome", locale),
              active: false,
              href: publicPathForView({ type: "home" }, locale),
              onClick: () => onChangeView({ type: "home" }),
            },
            {
              name: pageText("about.crumbTitle", locale),
              active: true,
            },
          ]}
        />
        <div className="about-meta" aria-label="Page last updated">
          <Calendar className="about-meta-icon" aria-hidden="true" />
          <time dateTime="2026-09">{pageText("about.updated", locale)}</time>
        </div>
      </header>

      {/* 2. HERO: Eyebrow + H1 + short opening story */}
      <section className="about-hero" aria-labelledby="about-hero-title">
        <p className="about-eyebrow">{pageText("about.eyebrow", locale)}</p>
        <h1 id="about-hero-title" className="about-display" itemProp="name">
          {pageText("about.heroHeading", locale)}
        </h1>
        <div className="about-lead-measure">
          <p className="about-lead-p">{pageText("about.heroP1", locale)}</p>
          <p className="about-body">{pageText("about.heroP2", locale)}</p>
        </div>
      </section>

      {/* 3. THE REASON: Why another tools website? */}
      <section className="about-editorial-section" aria-labelledby="about-reason-heading">
        <h2 id="about-reason-heading" className="about-h2">
          {pageText("about.reasonHeading", locale)}
        </h2>
        <div className="about-measure">
          <p className="about-body">{pageText("about.reasonP1", locale)}</p>
          <p className="about-body">{pageText("about.reasonP2", locale)}</p>
        </div>
      </section>

      {/* 4. WHAT GAINUTILITY IS: Built for the small things */}
      <section className="about-editorial-section" aria-labelledby="about-what-heading">
        <h2 id="about-what-heading" className="about-h2">
          {pageText("about.whatHeading", locale)}
        </h2>
        <div className="about-measure">
          <p className="about-body">{pageText("about.whatP1", locale)}</p>
          <ul className="about-feature-list" role="list">
            {bullets.map((b) => (
              <li key={b} className="about-feature-item">
                <span className="about-feature-bullet" aria-hidden="true" />
                <span>{pageText(b, locale)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Natural contextual internal links to key tool collections */}
        <div className="about-contextual-nav">
          <span className="about-contextual-label">{t("allToolsTab", locale)}:</span>
          <nav className="about-contextual-links" aria-label="GainUtility tool suites">
            <a
              href={publicPathForView({ type: "seo-page", id: "pdf" }, locale)}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "seo-page", id: "pdf" });
              }}
              className="about-contextual-link"
            >
              {t("catPdf", locale)}
            </a>
            <span className="about-contextual-sep" aria-hidden="true">·</span>
            <a
              href={publicPathForView({ type: "seo-page", id: "image" }, locale)}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "seo-page", id: "image" });
              }}
              className="about-contextual-link"
            >
              {t("catImages", locale)}
            </a>
            <span className="about-contextual-sep" aria-hidden="true">·</span>
            <a
              href={publicPathForView({ type: "seo-page", id: "dev" }, locale)}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "seo-page", id: "dev" });
              }}
              className="about-contextual-link"
            >
              {t("catDeveloper", locale)}
            </a>
            <span className="about-contextual-sep" aria-hidden="true">·</span>
            <a
              href={publicPathForView({ type: "tools-directory" }, locale)}
              onClick={(e) => {
                e.preventDefault();
                onChangeView({ type: "tools-directory" });
              }}
              className="about-contextual-link font-semibold"
            >
              {t("allToolsTab", locale)} &rarr;
            </a>
          </nav>
        </div>
      </section>

      {/* 5. BUILDER SECTION: One person, building it */}
      <section className="about-builder-section" aria-labelledby="about-person-heading">
        <div className="about-builder-marker" aria-hidden="true">
          <span className="about-builder-dot" />
        </div>
        <div className="about-builder-content">
          <h2 id="about-person-heading" className="about-builder-title">
            {pageText("about.personHeading", locale)}
          </h2>
          <p className="about-builder-body">
            {pageText("about.personP1", locale)}
          </p>
        </div>
      </section>

      {/* 6. PRINCIPLES: What I care about */}
      <section className="about-editorial-section" aria-labelledby="about-values-heading">
        <h2 id="about-values-heading" className="about-h2">
          {pageText("about.valuesHeading", locale)}
        </h2>
        <div className="about-values-grid">
          {values.map((v) => (
            <div key={v.key} className="about-value-card">
              <div className="about-value-icon-box" aria-hidden="true">
                {v.icon}
              </div>
              <h3 className="about-value-title">
                {pageText(`about.${v.key}.title`, locale)}
              </h3>
              <p className="about-value-body">
                {pageText(`about.${v.key}.body`, locale)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHAT GAINUTILITY IS NOT: What I don't want this to become */}
      <section className="about-editorial-section" aria-labelledby="about-not-heading">
        <h2 id="about-not-heading" className="about-h2">
          {pageText("about.notHeading", locale)}
        </h2>
        <div className="about-measure">
          <p className="about-body">{pageText("about.notP1", locale)}</p>
        </div>
      </section>

      {/* 8. CLOSING CTA: That's the idea */}
      <section className="about-closing-section" aria-labelledby="about-closing-heading">
        <div className="about-closing-rule" aria-hidden="true" />
        <h2 id="about-closing-heading" className="about-closing-title">
          {pageText("about.closingHeading", locale)}
        </h2>
        <p className="about-closing-body">
          {pageText("about.closingBody", locale)}
        </p>
        <div className="about-cta-container">
          <a
            href={publicPathForView({ type: "tools-directory" }, locale)}
            onClick={(e) => {
              e.preventDefault();
              onChangeView({ type: "tools-directory" });
            }}
            className="about-cta-btn"
          >
            <span>{pageText("about.cta", locale)}</span>
            <ArrowRight className="about-cta-arrow" aria-hidden="true" />
          </a>
        </div>
      </section>
    </article>
  );
};