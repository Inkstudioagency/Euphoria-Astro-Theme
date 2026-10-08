/**
 * Global site settings. Edit these values to rebrand the theme.
 * Keep placeholder contact data generic (example.com, 555 numbers).
 */
export const site = {
  name: 'Euphoria',
  /** Default <title> used by the home pages. */
  defaultTitle: 'Euphoria - Premium Fintech Astro Theme',
  defaultDescription:
    'Automate bookkeeping, forecast cash flow and close the books faster. Euphoria gives growing finance teams live reports and audit-ready controls in one place.',
  /** Default social share image (path inside /public or an absolute URL). */
  ogImage: '/images/og-image.webp',
  logo: '/images/euphoria-logo.svg',
  logoWhite: '/images/euphoria-logo-white.svg',
  copyright: '© 2026 Euphoria. All rights reserved.',
  /** Where the "Buy Template" card in the Pages mega menu points to. */
  templateUrl: 'https://astro.build/themes/',
  /** Primary call to action shown in the navbar. */
  cta: { label: 'Get Started', href: '/contact-v3' },
  credits: {
    designer: { label: 'Inks Studio', href: 'https://inks.studio' },
    poweredBy: { label: 'Astro', href: 'https://astro.build/themes/' },
  },
  /** Video opened by the "Watch Video" / play buttons (YouTube video id). */
  video: { youtubeId: 'setu9Ir1miY', title: 'Euphoria product video' },
  /** Root-domain links only — replace with your own profiles. */
  social: [
    { label: 'X', href: 'https://x.com', icon: '/images/icon-social-x.svg', alt: 'icon-social-x' },
    { label: 'LinkedIn', href: 'https://linkedin.com', icon: '/images/icon-social-linkedin.svg', alt: 'icon-social-linkedin' },
    { label: 'Facebook', href: 'https://facebook.com', icon: '/images/icon-social-facebook.svg', alt: 'icon-social-facebook' },
    { label: 'Discord', href: 'https://discord.com', icon: '/images/icon-social-discord.svg', alt: 'icon-social-discord' },
    { label: 'WhatsApp', href: 'https://whatsapp.com', icon: '/images/icon-social-whatsapp.svg', alt: 'icon-social-whatsapp' },
  ],
};
