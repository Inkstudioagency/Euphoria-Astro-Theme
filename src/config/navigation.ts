/** Navbar and footer menus. Edit labels, links and descriptions here. */

export const mainNav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about-v1' },
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
];

export const megaMenu = {
  label: 'Pages',
  image: { src: '/images/Mega-Menu-Image-2.png', alt: 'Euphoria template preview', cta: 'Buy Template' },
  columns: [
    {
      title: 'Home Page',
      links: [
        { label: 'Home Page V1', desc: 'Calm, clear, classic landing page', href: '/' },
        { label: 'Home Page V2', desc: 'Product-focused with real impact', href: '/home-v2' },
        { label: 'Home Page V3', desc: 'Visual storytelling meets structure', href: '/home-v3' },
      ],
    },
    {
      title: 'About Page',
      links: [
        { label: 'About Page V1', desc: 'Photo row, mission and milestones', href: '/about-v1' },
        { label: 'About Page V2', desc: 'Quote hero and vertical timeline', href: '/about-v2' },
        { label: 'About Page V3', desc: 'Story, values and the team', href: '/about-v3' },
      ],
    },
    {
      title: 'Contact Page',
      links: [
        { label: 'Contact Page V1', desc: 'Team-first with layered contact', href: '/contact-v1' },
        { label: 'Contact Page V2', desc: 'Steps, proof, and connection flow', href: '/contact-v2' },
        { label: 'Contact Page V3', desc: 'Minimal, direct, connection flow', href: '/contact-v3' },
      ],
    },
  ],
};

export const footerNav = [
  {
    title: 'Main Pages',
    links: [
      { label: 'Home V1', href: '/' },
      { label: 'Home V2', href: '/home-v2' },
      { label: 'Home V3', href: '/home-v3' },
      { label: 'About V1', href: '/about-v1' },
      { label: 'About V2', href: '/about-v2' },
      { label: 'About V3', href: '/about-v3' },
    ],
  },
  {
    title: 'Others Pages',
    links: [
      { label: 'Contact V1', href: '/contact-v1' },
      { label: 'Contact V2', href: '/contact-v2' },
      { label: 'Contact V3', href: '/contact-v3' },
      { label: 'Blog', href: '/blog' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Case Studies', href: '/case-studies' },
    ],
  },
  {
    title: 'Utility Pages',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Style Guide', href: '/style-guide' },
      { label: 'Not Found', href: '/404' },
    ],
  },
];
