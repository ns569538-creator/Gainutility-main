/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generates comprehensive native translations for blog articles 13-16 and 17-20.
 */

import fs from 'fs';

const raw13_16 = JSON.parse(fs.readFileSync('scratch/articles-13-16.json', 'utf8'));
const raw17_20 = JSON.parse(fs.readFileSync('scratch/articles-17-20.json', 'utf8'));

// Common locales
const locales = ["pt-br", "es-mx", "es-co", "de", "fr", "it", "id"];

// Generate Dev & Design (13-16)
import('./generate-design-dev-data.mjs').then(async (mod) => {
  mod.buildDesignDev();
  mod.buildDevSeo();
}).catch(async (e) => {
  console.error(e);
});
