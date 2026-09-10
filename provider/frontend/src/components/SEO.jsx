import React from "react";
import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  url,
  twitterCard = "summary_large_image",
  schema = null // added for AEO/GEO
}) => {
  const siteName = "Skilled Ustaad | Provider Portal";
  const defaultDescription = "Join Skilled Ustaad as a professional service provider. Manage bookings, track earnings, and grow your service business on India's most trusted service marketplace.";
  const defaultKeywords = "service provider, register as provider, plumber jobs, electrician jobs, cleaning jobs, freelance technician, service business, grow earnings, Skilled Ustaad Partner, Skilled Ustaad Provider";
  const defaultImage = "/logo-main.png";
  const siteUrl = "https://provider.skilledustaad.com";

  const seoTitle = title ? `${title} | ${siteName}` : siteName;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const seoImage = ogImage || defaultImage;
  const seoUrl = url || siteUrl;

  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Skilled Ustaad Provider Portal",
    "alternateName": ["Skilled Ustaad Partner", "Skilled Ustaad Provider", "skilledustaad provider"],
    "url": siteUrl,
    "description": defaultDescription,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={`${seoKeywords}, skilledustaad, Skilled Ustaad, skilleUstaad, Skilledustaad, provider, partner`} />
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <link rel="canonical" href={seoUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seoUrl} />
      <meta property="og:title" content={ogTitle || seoTitle} />
      <meta property="og:description" content={ogDescription || seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={seoUrl} />
      <meta name="twitter:title" content={ogTitle || seoTitle} />
      <meta name="twitter:description" content={ogDescription || seoDescription} />
      <meta name="twitter:image" content={seoImage} />

      {/* Structured Data (JSON-LD) - Default */}
      <script type="application/ld+json">
        {JSON.stringify(defaultSchema)}
      </script>

      {/* Structured Data (JSON-LD) - Dynamic for AEO/GEO */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

