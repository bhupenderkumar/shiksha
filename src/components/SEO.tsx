import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  ogImage?: string;
  noindex?: boolean;
}

const SITE_URL = 'https://myfirststepschool.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`;
const SITE_NAME = 'First Step Pre School & Primary School';

/**
 * Per-page SEO meta tags. Wraps title, description, canonical,
 * Open Graph and Twitter Card so each public route gets unique
 * indexable metadata. Use on every public-facing page.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
}) => {
  const fullUrl = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:url" content={fullUrl} />
    </Helmet>
  );
};

export default SEO;
