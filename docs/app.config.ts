export default defineAppConfig({
  ui: {
    primary: 'cyan',
    gray: 'neutral',
    footer: {
      bottom: {
        left: 'text-sm text-gray-500 dark:text-gray-400',
        wrapper: 'border-t border-gray-200 dark:border-gray-800',
      },
    },
  },
  seo: {
    siteName: 'DAR-ACT-Cache - Darbot Action Runner Cache Server',
  },
  header: {
    logo: {
      alt: '',
      light: '',
      dark: '',
    },
    search: true,
    colorMode: true,
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/darbot/dar-act-cache',
        'target': '_blank',
        'aria-label': 'DAR-ACT-Cache on GitHub',
      },
    ],
  },
  footer: {
    credits: '',
    colorMode: false,
    links: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/darbot/dar-act-cache',
        'target': '_blank',
        'aria-label': 'DAR-ACT-Cache on GitHub',
      },
    ],
  },
  toc: {
    title: 'Table of Contents',
    bottom: {
      title: 'Community',
      edit: 'https://github.com/darbot/dar-act-cache/edit/master/docs/content',
      links: [
        {
          icon: 'i-heroicons-star',
          label: 'Star on GitHub',
          to: 'https://github.com/darbot/dar-act-cache',
          target: '_blank',
        },
      ],
    },
  },
})
