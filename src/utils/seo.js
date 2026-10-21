/**
 * ZOYARA Full-Proof Dynamic SEO & Tag Management Engine
 * Automatically applies SEO, Verification, Analytics, Ads, and Schema.org
 * dynamically from Store Settings without requiring code edits.
 */

export function applyDynamicSeo(settings) {
  if (typeof document === "undefined" || !settings) return;

  // 1. Document Title
  const title = settings.seoTitle || `${settings.name || "ZOYARA"} — Fashion & Comfort | Anti-Tarnish Jewellery & Intimates`;
  document.title = title;

  // Helper to upsert meta tags
  const setMeta = (name, content, isProperty = false) => {
    if (!content) return;
    const attr = isProperty ? "property" : "name";
    let meta = document.querySelector(`meta[${attr}="${name}"]`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attr, name);
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
  };

  // 2. Standard SEO Meta
  const description = settings.seoDescription || "ZOYARA — Fashion & Comfort. Curated 18K anti-tarnish waterproof jewellery, zero-wire bras, and seamless intimates crafted for everyday elegance.";
  setMeta("description", description);

  const keywords = settings.seoKeywords || "zoyara, fashion and comfort, anti-tarnish jewellery, 18k jewellery, waterproof jewellery, wirefree bras, seamless underwear, affordable luxury jewellery india";
  setMeta("keywords", keywords);

  setMeta("robots", settings.seoRobots || "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");

  // 3. Google Site Verification & Webmaster Tokens
  if (settings.googleSiteVerification) {
    setMeta("google-site-verification", settings.googleSiteVerification);
  }
  if (settings.bingSiteVerification) {
    setMeta("msvalidate.01", settings.bingSiteVerification);
  }
  if (settings.pinterestVerification) {
    setMeta("p:domain_verify", settings.pinterestVerification);
  }

  // 4. Open Graph & Social Media Tags
  const siteUrl = settings.siteUrl || "https://zoyara.vercel.app";
  const ogImage = settings.ogImage || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80";

  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  setMeta("og:url", siteUrl, true);
  setMeta("og:site_name", "ZOYARA — Fashion & Comfort", true);
  setMeta("og:image", ogImage, true);
  setMeta("og:type", "website", true);

  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", title);
  setMeta("twitter:description", description);
  setMeta("twitter:image", ogImage);

  // 5. Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", siteUrl);

  // 6. Google Analytics 4 (GA4) Injection
  if (settings.googleAnalyticsId && !document.getElementById("zoyara-ga-script")) {
    const gaId = settings.googleAnalyticsId.trim();
    const gaScript = document.createElement("script");
    gaScript.id = "zoyara-ga-script";
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(gaScript);

    const gaInline = document.createElement("script");
    gaInline.id = "zoyara-ga-inline";
    gaInline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(gaInline);
  }

  // 7. Google Ads / AdSense Client Script Injection
  if (settings.googleAdsClientId && !document.getElementById("zoyara-adsense-script")) {
    const adsScript = document.createElement("script");
    adsScript.id = "zoyara-adsense-script";
    adsScript.async = true;
    adsScript.crossOrigin = "anonymous";
    adsScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.googleAdsClientId.trim()}`;
    document.head.appendChild(adsScript);
  }

  // 8. Custom Header HTML / Tracking Code injection
  if (settings.customHeaderHtml && !document.getElementById("zoyara-custom-header")) {
    const customDiv = document.createElement("div");
    customDiv.id = "zoyara-custom-header";
    customDiv.style.display = "none";
    customDiv.innerHTML = settings.customHeaderHtml;
    document.head.appendChild(customDiv);
  }

  // 9. Structured Data (JSON-LD Organization, Store, and Website Schema)
  let schemaScript = document.getElementById("zoyara-jsonld-schema");
  if (!schemaScript) {
    schemaScript = document.createElement("script");
    schemaScript.id = "zoyara-jsonld-schema";
    schemaScript.type = "application/ld+json";
    document.head.appendChild(schemaScript);
  }

  const stores = settings.offlineStores || [
    {
      name: "ZOYARA Flagship Showroom",
      address: settings.address || "Shop 4, Luxury Arcade, Main Market",
      city: "New Delhi",
      state: "Delhi",
      pincode: "110049",
      phone: settings.phone || "+91 98765 43210"
    }
  ];

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "ZOYARA",
        "alternateName": "ZOYARA — Fashion & Comfort",
        "url": siteUrl,
        "logo": `${siteUrl}/favicon.svg`,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": settings.phone || "+91 98765 43210",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        }
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "ZOYARA — Fashion & Comfort",
        "description": description,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${siteUrl}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      ...stores.map((store, i) => ({
        "@type": "ClothingStore",
        "@id": `${siteUrl}/#store-${i}`,
        "name": store.name || "ZOYARA Store",
        "telephone": store.phone || settings.phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": store.address,
          "addressLocality": store.city,
          "addressRegion": store.state,
          "postalCode": store.pincode,
          "addressCountry": "IN"
        },
        "priceRange": "₹150 - ₹400"
      }))
    ]
  };

  schemaScript.text = JSON.stringify(jsonLdData);
}
