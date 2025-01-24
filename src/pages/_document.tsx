import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name='application-name' content='First Step Public School - Best School in Saurbah Vihar, Jaitpur' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='First Step Public School' />
        <meta name='description' content='First Step Public School in Saurbah Vihar, Jaitpur offers quality education and grade admissions in Delhi. Join the best school in East Delhi for excellent academic programs, experienced faculty, and modern facilities. Admissions open for 2024-25.' />
        <meta name='keywords' content='First Step Public School, Saurbah Vihar school, Jaitpur school, grade admission Delhi, best school in East Delhi, school admission 2024-25, CBSE school Delhi, primary school Delhi, secondary school Delhi, school fees structure, school infrastructure, school facilities, education in Delhi, top schools near me, best education in Delhi, affordable school fees, experienced teachers, smart classrooms, sports facilities, computer lab, science lab, library' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#4f46e5' />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="geo.region" content="IN-DL" />
        <meta name="geo.placename" content="Saurbah Vihar, Jaitpur, Delhi" />
        <meta name="geo.position" content="28.5244;77.2855" />
        <meta name="ICBM" content="28.5244, 77.2855" />
        <meta name="author" content="First Step Public School" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="First Step Public School" />
        <meta property="og:title" content="First Step Public School - Best School in Saurbah Vihar" />
        <meta property="og:description" content="First Step Public School in Saurbah Vihar, Jaitpur offers quality education and grade admissions in Delhi. Join the best school in East Delhi for excellent academic programs. Admissions open for 2024-25." />
        <meta property="og:image" content="http://myfirststepschool.com/school-image.jpg" />
        <meta property="og:url" content="http://myfirststepschool.com" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@FirstStepSchool" />
        <meta name="twitter:title" content="First Step Public School - Best School in Saurbah Vihar" />
        <meta name="twitter:description" content="First Step Public School in Saurbah Vihar, Jaitpur offers quality education and grade admissions in Delhi. Join the best school in East Delhi." />
        <meta name="twitter:image" content="http://myfirststepschool.com/school-image.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="http://myfirststepschool.com" />

        {/* Favicon and App Icons */}
        <link rel='apple-touch-icon' sizes="180x180" href='/icons/apple-touch-icon.png' />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel='manifest' href='/manifest.json' />
        <link rel='shortcut icon' href='/favicon.ico' />

        {/* Schema.org markup for Google */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "School",
              "name": "First Step Public School",
              "description": "First Step Public School in Saurbah Vihar, Jaitpur offers quality education and grade admissions in Delhi",
              "url": "http://myfirststepschool.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Saurbah Vihar",
                "addressLocality": "Jaitpur",
                "addressRegion": "Delhi",
                "postalCode": "110044",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "28.5244",
                "longitude": "77.2855"
              },
              "telephone": "+91-XXXXXXXXXX",
              "email": "info@myfirststepschool.com",
              "areaServed": "Delhi NCR",
              "foundingDate": "YYYY",
              "keywords": "School, Education, Delhi, Saurbah Vihar, Jaitpur",
              "sameAs": [
                "https://www.facebook.com/FirstStepSchool",
                "https://twitter.com/FirstStepSchool",
                "https://www.instagram.com/FirstStepSchool"
              ]
            }
          `}
        </script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
