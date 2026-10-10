const {themes} = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

const config = {
  title: 'AI Documentation Demo',
  tagline: 'AI-powered documentation from Jira',
  favicon: 'img/favicon.ico',
  
  url: 'https://YOUR_USERNAME.github.io',
  baseUrl: '/RN-Generator-AI-Agent-Demo/',
  
  organizationName: 'YOUR_USERNAME',
  projectName: 'RN-Generator-AI-Agent-Demo',
  
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  
  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          path: 'docs',
          routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  
  plugins: [
    function internalDocsPlugin() {
      return {
        name: 'internal-docs',
        async contentLoaded({actions}) {
          if (process.env.DEPLOY_ENV === 'staging') {
            const {addRoute} = actions;
            addRoute({
              path: '/internal/',
              component: '@site/src/pages/internal/index.js',
            });
          }
        },
      };
    },
  ],
  
  themeConfig:
    ({
      navbar: {
        title: 'AI Documentation Demo',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Documentation',
          },
          ...(process.env.DEPLOY_ENV === 'staging' ? [{
            to: '/internal/',
            label: 'Internal Preview',
            position: 'right',
          }] : []),
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `© ${new Date().getFullYear()} AI Documentation Demo.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;