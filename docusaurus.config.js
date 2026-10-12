const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;
const config = {
  title: 'AI Documentation Demo', tagline: 'AI-powered docs', favicon: 'img/favicon.ico',
  url: 'https://RCG1412.github.io', baseUrl: '/RN-Generator-AI-Agent-Demo/',
  organizationName: 'RCG1412', projectName: 'RN-Generator-AI-Agent-Demo',
  onBrokenLinks: 'throw', onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en'] },
  presets: [['classic', ({ docs: { sidebarPath: require.resolve('./sidebars.js'), path: 'docs', routeBasePath: 'docs' }, blog: false, theme: { customCss: require.resolve('./src/css/custom.css') } })]],
  plugins: [function internalDocsPlugin() { return { name: 'internal-docs', async contentLoaded({ actions }) { if (process.env.DEPLOY_ENV === 'staging') { const { addRoute } = actions; addRoute({ path: '/internal/', component: '@site/src/pages/internal/index.js' }); } } }; }],
  themeConfig: ({ navbar: { title: 'AI Docs Demo', items: [{ type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Documentation' }, ...(process.env.DEPLOY_ENV === 'staging' ? [{ to: '/internal/', label: 'Internal Preview', position: 'right' }] : [])] }, footer: { style: 'dark', links: [] }, prism: { theme: lightCodeTheme, darkTheme: darkCodeTheme } }),
};
module.exports = config;