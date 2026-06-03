#!/usr/bin/env node
/**
 * RevenueCat Sync Script
 * ----------------------
 * Reads scripts/revenuecat.config.json and ensures RevenueCat matches it exactly.
 *
 * Features:
 *  - Idempotent: safe to run multiple times, only creates or attaches what is missing
 *  - Detects and removes legacy products (wrong bundle ID) from entitlements & packages
 *  - Dry-run mode: prints what would change without making any API calls
 *  - Retry logic: automatically retries resource-locked errors
 *
 * Usage:
 *   REVENUECAT_API_KEY=<v2-key> node scripts/sync-revenuecat.js
 *   REVENUECAT_API_KEY=<v2-key> node scripts/sync-revenuecat.js --dry-run
 *
 * Windows PowerShell:
 *   $env:REVENUECAT_API_KEY="<v2-key>"; node scripts/sync-revenuecat.js
 *
 * Where to get your API v2 key:
 *   RevenueCat dashboard → Project settings → API keys → + New → select "API v2" type
 *
 * Requires: Node.js 18+ (built-in fetch)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Args ─────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Config ────────────────────────────────────────────────────────────────

const API_KEY = process.env.REVENUECAT_API_KEY;
if (!API_KEY) {
  console.error('\n❌  Missing REVENUECAT_API_KEY\n');
  console.error('  Get yours: RevenueCat dashboard → Project settings → API keys → + New → "API v2"');
  console.error('\n  Mac/Linux:  REVENUECAT_API_KEY=your_key node scripts/sync-revenuecat.js');
  console.error('  Windows:    $env:REVENUECAT_API_KEY="your_key"; node scripts/sync-revenuecat.js\n');
  process.exit(1);
}

const CONFIG_PATH = path.join(__dirname, 'revenuecat.config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

const BASE    = 'https://api.revenuecat.com/v2';
const PROJECT = config.projectId;

// IDs of legacy products that should NOT be in entitlements/packages
const LEGACY_PRODUCT_IDS = new Set(
  (config._legacyProducts || []).map((p) => p.id)
);

// ─── Logging ───────────────────────────────────────────────────────────────

const PAD = 48;
const ok      = (msg) => console.log('  ✅', msg);
const skip    = (msg) => console.log('  ⏭ ', msg);
const warn    = (msg) => console.log('  ⚠️ ', msg);
const fix     = (msg) => console.log('  🔧', DRY_RUN ? `[DRY RUN] would: ${msg}` : msg);
const info    = (msg) => console.log('  ℹ️ ', msg);
const header  = (msg) => console.log(`\n── ${msg} ${'─'.repeat(Math.max(0, PAD - msg.length))}`);
const sleep   = (ms)  => new Promise((r) => setTimeout(r, ms));

// ─── HTTP client ──────────────────────────────────────────────────────────

async function rcFetch(method, urlPath, body, retries = 3) {
  if (DRY_RUN && method !== 'GET') {
    fix(`${method} ${urlPath} ${body ? JSON.stringify(body) : ''}`);
    return { dryRun: true };
  }

  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }

  if (!res.ok) {
    if (json.type === 'resource_already_exists') return { ...json, alreadyExists: true };
    if (json.type === 'resource_locked_error' && retries > 0) {
      info(`Resource locked — retrying in 1.5s… (${method} ${urlPath})`);
      await sleep(1500);
      return rcFetch(method, urlPath, body, retries - 1);
    }
    throw new Error(`[${method} ${urlPath}] HTTP ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

// ─── Paginated list helper ────────────────────────────────────────────────

async function rcList(urlPath) {
  const data = await rcFetch('GET', `${urlPath}?limit=100`);
  return data.items || [];
}

// ─── API wrappers ──────────────────────────────────────────────────────────

const listApps        = ()         => rcList(`/projects/${PROJECT}/apps`);
const listProducts    = ()         => rcList(`/projects/${PROJECT}/products`);
const listEntitlements= ()         => rcList(`/projects/${PROJECT}/entitlements`);
const listOfferings   = ()         => rcList(`/projects/${PROJECT}/offerings`);
const listPackages    = (oId)      => rcList(`/projects/${PROJECT}/offerings/${oId}/packages`);

const getEntitlementProducts = (eId) =>
  rcList(`/projects/${PROJECT}/entitlements/${eId}/products`).then((items) => items.map((p) => p.id));

const getPackageProducts = (oId, pkgId) =>
  rcList(`/projects/${PROJECT}/offerings/${oId}/packages/${pkgId}/products`).then((items) => items.map((p) => p.id));

const createApp = (app) =>
  rcFetch('POST', `/projects/${PROJECT}/apps`, {
    name: app.name,
    type: app.type,
    ...(app.bundleId    ? { bundle_id:    app.bundleId }    : {}),
    ...(app.packageName ? { package_name: app.packageName } : {}),
  });

const createProduct = (p) =>
  rcFetch('POST', `/projects/${PROJECT}/products`, {
    app_id: p.appId,
    store_identifier: p.storeIdentifier,
    type: p.type,
  });

const createEntitlement = (e) =>
  rcFetch('POST', `/projects/${PROJECT}/entitlements`, {
    lookup_key: e.lookupKey,
    display_name: e.displayName,
  });

const attachProductsToEntitlement = (eId, ids) =>
  rcFetch('POST', `/projects/${PROJECT}/entitlements/${eId}/products/attach`, { product_ids: ids });

const detachProductsFromEntitlement = (eId, ids) =>
  rcFetch('POST', `/projects/${PROJECT}/entitlements/${eId}/products/detach`, { product_ids: ids });

const createOffering = (o) =>
  rcFetch('POST', `/projects/${PROJECT}/offerings`, {
    lookup_key: o.lookupKey,
    display_name: o.displayName,
  });

const createPackage = (oId, pkg) =>
  rcFetch('POST', `/projects/${PROJECT}/offerings/${oId}/packages`, {
    lookup_key: pkg.lookupKey,
    display_name: pkg.displayName,
    position: pkg.position || 1,
  });

const attachProductToPackage = (oId, pkgId, productId) =>
  rcFetch('POST', `/projects/${PROJECT}/offerings/${oId}/packages/${pkgId}/products/attach`, {
    product_id: productId,
  });

const detachProductFromPackage = (oId, pkgId, productId) =>
  rcFetch('POST', `/projects/${PROJECT}/offerings/${oId}/packages/${pkgId}/products/detach`, {
    product_id: productId,
  });

// ─── Sync steps ────────────────────────────────────────────────────────────

const stats = { checked: 0, created: 0, attached: 0, detached: 0, errors: 0 };

async function syncApps() {
  header('Apps');
  const existing = await listApps();
  const idMap = {};

  for (const app of config.apps) {
    stats.checked++;
    const match = existing.find(
      (e) =>
        e.type === app.type &&
        ((app.bundleId    && e.bundle_id    === app.bundleId) ||
         (app.packageName && e.package_name === app.packageName))
    );

    if (match) {
      ok(`"${app.name}"  →  ${app.bundleId || app.packageName}`);
      idMap[app.id] = match.id;
    } else {
      const created = await createApp(app);
      if (!created.dryRun) {
        ok(`Created "${app.name}" → id: ${created.id}`);
        idMap[app.id] = created.id;
        stats.created++;
      } else {
        idMap[app.id] = app.id;
      }
    }
  }

  // Report legacy apps
  const legacyApps = config._legacyApps || [];
  if (legacyApps.length) {
    warn(`${legacyApps.length} legacy app(s) still exist in RevenueCat with wrong bundle ID:`);
    for (const a of legacyApps) {
      warn(`  "${a.name}"  (${a.bundleId || a.packageName})  — delete manually from RC dashboard`);
    }
  }

  return idMap;
}

async function syncProducts(appIdMap) {
  header('Products');
  const existing = await listProducts();
  const idMap = {};

  for (const product of config.products) {
    stats.checked++;
    const realAppId = appIdMap[product.appId] || product.appId;
    const match = existing.find(
      (e) => e.store_identifier === product.storeIdentifier && e.app_id === realAppId
    );

    if (match) {
      ok(`"${product.displayName}"  →  ${product.storeIdentifier}`);
      idMap[product.id] = match.id;
    } else {
      const created = await createProduct({ ...product, appId: realAppId });
      if (!created.dryRun) {
        ok(`Created "${product.displayName}"  →  ${product.storeIdentifier}`);
        idMap[product.id] = created.id;
        stats.created++;
      } else {
        idMap[product.id] = product.id;
      }
    }
  }

  return idMap;
}

async function syncEntitlements(productIdMap) {
  header('Entitlements');
  const existing = await listEntitlements();

  for (const ent of config.entitlements) {
    stats.checked++;
    let realId;
    const match = existing.find((e) => e.lookup_key === ent.lookupKey);

    if (match) {
      ok(`Entitlement "${ent.lookupKey}" exists`);
      realId = match.id;
    } else {
      const created = await createEntitlement(ent);
      ok(`Created entitlement "${ent.lookupKey}"`);
      realId = created.dryRun ? ent.id : created.id;
      stats.created++;
    }

    // Determine what should vs shouldn't be attached
    const attached      = await getEntitlementProducts(realId);
    const wantIds       = ent.attachedProductIds.map((pid) => productIdMap[pid] || pid);
    const toAttach      = wantIds.filter((pid) => !attached.includes(pid));
    const toDetach      = attached.filter((pid) => LEGACY_PRODUCT_IDS.has(pid));

    if (toDetach.length) {
      fix(`Detaching ${toDetach.length} legacy product(s) from "${ent.lookupKey}"`);
      if (!DRY_RUN) {
        await detachProductsFromEntitlement(realId, toDetach);
        stats.detached += toDetach.length;
      }
    }

    if (toAttach.length) {
      fix(`Attaching ${toAttach.length} product(s) to "${ent.lookupKey}"`);
      if (!DRY_RUN) {
        await attachProductsToEntitlement(realId, toAttach);
        stats.attached += toAttach.length;
      }
    }

    if (!toAttach.length && !toDetach.length) {
      ok(`All products correctly attached to "${ent.lookupKey}"`);
    }
  }
}

async function syncOfferings(productIdMap) {
  header('Offerings & Packages');
  const existing = await listOfferings();

  for (const offering of config.offerings) {
    stats.checked++;
    let realOfferingId;
    const match = existing.find((e) => e.lookup_key === offering.lookupKey);

    if (match) {
      ok(`Offering "${offering.lookupKey}" exists`);
      realOfferingId = match.id;
    } else {
      const created = await createOffering(offering);
      ok(`Created offering "${offering.lookupKey}"`);
      realOfferingId = created.dryRun ? offering.id : created.id;
      stats.created++;
    }

    const existingPkgs = await listPackages(realOfferingId);

    for (const pkg of offering.packages) {
      stats.checked++;
      let realPkgId;
      const pkgMatch = existingPkgs.find((e) => e.lookup_key === pkg.lookupKey);

      if (pkgMatch) {
        ok(`Package "${pkg.lookupKey}" exists`);
        realPkgId = pkgMatch.id;
      } else {
        const created = await createPackage(realOfferingId, pkg);
        ok(`Created package "${pkg.lookupKey}"`);
        realPkgId = created.dryRun ? pkg.id : created.id;
        stats.created++;
      }

      const attachedInPkg = await getPackageProducts(realOfferingId, realPkgId);

      // Detach legacy products from package
      const toDetachFromPkg = attachedInPkg.filter((pid) => LEGACY_PRODUCT_IDS.has(pid));
      if (toDetachFromPkg.length) {
        fix(`Detaching ${toDetachFromPkg.length} legacy product(s) from package "${pkg.lookupKey}"`);
        for (const pid of toDetachFromPkg) {
          if (!DRY_RUN) {
            await detachProductFromPackage(realOfferingId, realPkgId, pid);
            stats.detached++;
          }
        }
      }

      // Attach correct products
      for (const [_appId, configProductId] of Object.entries(pkg.attachedProductIds)) {
        const realProductId = productIdMap[configProductId] || configProductId;
        if (attachedInPkg.includes(realProductId)) {
          ok(`Correct product already in package "${pkg.lookupKey}"`);
        } else {
          fix(`Attaching product to package "${pkg.lookupKey}"`);
          if (!DRY_RUN) {
            await attachProductToPackage(realOfferingId, realPkgId, realProductId);
            stats.attached++;
          }
        }
      }
    }
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const mode = DRY_RUN ? ' [DRY RUN — no changes will be made]' : '';

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   RevenueCat Sync — Credibility Radar              ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log(`\n  Project : ${PROJECT}`);
  console.log(`  Config  : scripts/revenuecat.config.json`);
  console.log(`  API key : ${API_KEY.slice(0, 8)}${'*'.repeat(12)}`);
  console.log(`  Mode    : ${DRY_RUN ? '🔍 DRY RUN' : '🚀 LIVE'}${mode}\n`);

  try {
    const appIdMap     = await syncApps();
    const productIdMap = await syncProducts(appIdMap);
    await syncEntitlements(productIdMap);
    await syncOfferings(productIdMap);

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║  ${DRY_RUN ? '🔍' : '✅'}  Sync ${DRY_RUN ? 'preview' : 'complete'}                             ║`);
    console.log('╚════════════════════════════════════════════════════╝');
    console.log(`\n  Checked  : ${stats.checked}`);
    console.log(`  Created  : ${stats.created}`);
    console.log(`  Attached : ${stats.attached}`);
    console.log(`  Detached : ${stats.detached}  ${stats.detached > 0 ? '(legacy products removed)' : ''}`);
    console.log(`  Errors   : ${stats.errors}`);
    if (DRY_RUN) {
      console.log('\n  Run without --dry-run to apply these changes.\n');
    } else {
      console.log('\n  RevenueCat now matches revenuecat.config.json ✓\n');
    }
  } catch (err) {
    console.error('\n❌  FATAL:', err.message);
    process.exit(1);
  }
}

main();
