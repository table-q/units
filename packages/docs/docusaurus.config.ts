import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: 'Units',
  tagline: 'Exact-arithmetic financial math using BigInt rationals',
  favicon: 'img/favicon.ico',
  url: 'https://table-q.github.io',
  baseUrl: '/units/',
  organizationName: 'table-q',
  projectName: 'units',
  onBrokenLinks: 'throw',

  markdown: {
    format: 'detect',
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/table-q/units/tree/main/packages/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Units',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          label: 'Docs',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/table-q/units',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Packages',
          items: [
            { label: '@table-q/units', to: '/docs/units/' },
            { label: 'Plugins', to: '/docs/plugins/' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: 'https://github.com/table-q/units' },
            { label: 'npm', href: 'https://www.npmjs.com/org/table-q' },
          ],
        },
      ],
      copyright: 'MIT Licensed',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
