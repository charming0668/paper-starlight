// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
	site: 'https://charming0668.github.io',
	base: '/paper-starlight',
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
	},
	integrations: [
		starlight({
			title: '具身智能前沿 (Starlight 现代版)',
			customCss: ['katex/dist/katex.min.css'],
			head: [
				{
					tag: 'script',
					attrs: {
						type: 'module',
						src: '/paper-starlight/scripts/mermaid-loader.js',
					},
				},
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/charming0668/paper-starlight' }],
			sidebar: [
				{
					label: '论文精读专栏',
					items: [{ autogenerate: { directory: 'paper_2507.12440' } }]
				},
			],
		}),
	],
});
