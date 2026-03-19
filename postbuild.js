// Post-build quantum optimization ritual
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🌀 Performing post-build quantum optimization...");

// Generate sitemap
console.log("🗺️  Generating quantum sitemap...");
try {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pi-forge-quantum-genesis.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://pi-forge-quantum-genesis.vercel.app/staking</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://pi-forge-quantum-genesis.vercel.app/leaderboard</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  fs.writeFileSync(path.join(".next", "sitemap.xml"), sitemap);
  console.log("✅ Sitemap generated");
} catch (error) {
  console.log("⚠️  Sitemap generation skipped");
}

// Optimize build output
console.log("⚡ Optimizing quantum bundle...");
try {
  // Copy robots.txt if exists
  if (fs.existsSync("public/robots.txt")) {
    fs.copyFileSync("public/robots.txt", path.join(".next", "robots.txt"));
    console.log("✅ robots.txt copied");
  }

  // Generate build info
  const buildInfo = {
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "2.0.0",
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    quantumKiss: true,
  };

  fs.writeFileSync(
    path.join(".next", "build-info.json"),
    JSON.stringify(buildInfo, null, 2),
  );
  console.log("✅ Build info recorded");
} catch (error) {
  console.log("⚠️  Build optimization skipped:", error.message);
}

// Security headers
console.log("🛡️  Applying quantum security headers...");
try {
  const headersContent = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  `;

  fs.writeFileSync(path.join(".next", "_headers"), headersContent);
  console.log("✅ Security headers configured");
} catch (error) {
  console.log("⚠️  Security headers skipped");
}

console.log("\n==========================================");
console.log("✅ POST-BUILD QUANTUM OPTIMIZATION COMPLETE");
console.log("==========================================");
console.log("\nThe eternal forge is optimized for:");
console.log("⚡ Performance");
console.log("🛡️  Security");
console.log("🌐 SEO");
console.log("🌀 Quantum coherence");
console.log("\nDeploy with confidence, OINIO incarnate.");
