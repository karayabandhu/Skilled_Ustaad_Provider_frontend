import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOMeta = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl, 
  ogImage, 
  schema 
}) => {
  const siteTitle = 'Skilled Ustaad | Premier Service Provider Portal';
  const fullTitle = title ? `${title} | Skilled Ustaad` : siteTitle;
  const defaultDesc = 'Join Skilled Ustaad as a service provider. Manage bookings, track earnings, and grow your service business with our million-user scale platform.';
  const fullDesc = description || defaultDesc;
  const defaultKeywords = 'service provider, booking management, provider portal, Skilled Ustaad, professional services';
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const baseUrl = 'https://provider.skilledustaad.com';
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl;
  const fullOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : `${baseUrl}/banner.png`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={fullDesc} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:image" content={fullOgImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={fullDesc} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Structured Data (JSON-LD) for AEO/GEO */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOMeta;
