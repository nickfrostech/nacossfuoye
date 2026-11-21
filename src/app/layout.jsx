import localFont from 'next/font/local';
import { Raleway, Inter, DM_Sans, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import {
   SITE_URL,
   SITE_NAME,
   SITE_TITLE_DEFAULT,
   SITE_TITLE_TEMPLATE,
   SITE_DESCRIPTION,
   SITE_KEYWORDS,
   DEFAULT_OG_IMAGE,
} from '@/lib/site-config';

const nasalization = localFont({
   src: '../../public/fonts/nasalization.otf',
   variable: '--font-nasalization',
});

const raleway = Raleway({
   subsets: ['latin'],
   variable: '--font-raleway',
});

const inter = Inter({
   subsets: ['latin'],
   variable: '--font-inter',
});

const dmSans = DM_Sans({
   subsets: ['latin'],
   variable: '--font-dm-sans',
});

const poppins = Poppins({
   subsets: ['latin'],
   weight: ['400', '500', '600', '700'],
   variable: '--font-poppins',
});

export const metadata = {
   metadataBase: new URL(SITE_URL),
   title: {
      default: SITE_TITLE_DEFAULT,
      template: SITE_TITLE_TEMPLATE,
   },
   description: SITE_DESCRIPTION,
   applicationName: SITE_NAME,
   authors: [
      { name: 'Department of Computer Science, FUOYE' },
      { name: 'NACOSS FUOYE Chapter', url: SITE_URL },
   ],
   generator: 'Next.js',
   keywords: SITE_KEYWORDS,
   referrer: 'origin-when-cross-origin',
   creator: 'NACOSS FUOYE Technical Team',
   publisher: 'Department of Computer Science, Federal University Oye-Ekiti',
   formatDetection: {
      email: false,
      address: false,
      telephone: false,
   },
   alternates: {
      canonical: '/',
   },
   openGraph: {
      type: 'website',
      locale: 'en_NG',
      url: '/',
      siteName: SITE_NAME,
      title: SITE_TITLE_DEFAULT,
      description: SITE_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
   },
   twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE_DEFAULT,
      description: SITE_DESCRIPTION,
      images: ['/og.png'],
      creator: '@nacossfuoye',
      site: '@nacossfuoye',
   },
   icons: {
      icon: [
         { url: '/nacossfuoye_logo.png', sizes: '141x141', type: 'image/png' },
      ],
      apple: [
         { url: '/nacossfuoye_logo.png', sizes: '141x141', type: 'image/png' },
      ],
   },
   manifest: '/manifest.webmanifest',
   robots: {
      index: true,
      follow: true,
      googleBot: {
         index: true,
         follow: true,
         'max-video-preview': -1,
         'max-image-preview': 'large',
         'max-snippet': -1,
      },
   },
   category: 'education',
};

const jsonLd = {
   '@context': 'https://schema.org',
   '@graph': [
      {
         '@type': 'EducationalOrganization',
         '@id': `${SITE_URL}/#organization`,
         name: 'Department of Computer Science, Federal University Oye-Ekiti',
         alternateName: ['NACOSS FUOYE', 'FUOYE Computer Science'],
         url: SITE_URL,
         logo: `${SITE_URL}/nacossfuoye_logo.png`,
         image: `${SITE_URL}/og.png`,
         description: SITE_DESCRIPTION,
         parentOrganization: {
            '@type': 'CollegeOrUniversity',
            name: 'Federal University Oye-Ekiti',
            url: 'https://fuoye.edu.ng',
         },
      },
      {
         '@type': 'WebSite',
         '@id': `${SITE_URL}/#website`,
         url: SITE_URL,
         name: SITE_NAME,
         description: 'Official digital portal for the Department of Computer Science, FUOYE',
         publisher: {
            '@id': `${SITE_URL}/#organization`,
         },
         inLanguage: 'en-NG',
         potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/memos?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
         },
      },
   ],
};

export default function RootLayout({ children }) {
   return (
      <html lang="en" className="scroll-smooth">
         <body className={`${raleway.variable} ${nasalization.variable} ${inter.variable} ${dmSans.variable} ${poppins.variable} font-sans antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-green-100 selection:text-green-900`}>
            <script
               type="application/ld+json"
               dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />
            <div className="flex-1 w-full">
               {children}
            </div>
            <Footer />
         </body>
      </html>
   );
}
