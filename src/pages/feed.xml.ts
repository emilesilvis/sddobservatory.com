import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';

// One combined feed of new additions only — `lastReviewed` updates are deliberately
// excluded to keep the feed low-noise. Summaries carry `backtick` code spans; feed
// descriptions want plain text, same as the meta tags in BaseLayout.
export async function GET(context: APIContext) {
  const frameworks = await getCollection('frameworks');
  const projects = await getCollection('projects');

  const items = [
    ...frameworks.map((framework) => ({
      title: `New framework: ${framework.data.name}`,
      link: `/frameworks/${framework.id}/`,
      pubDate: framework.data.added,
      description: framework.data.summary.replaceAll('`', ''),
    })),
    ...projects.map((project) => ({
      title: `New project: ${project.data.name}`,
      link: `/projects/${project.id}/`,
      pubDate: project.data.added,
      description: project.data.summary.replaceAll('`', ''),
    })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime() || a.title.localeCompare(b.title));

  return rss({
    title: `${SITE.name} — new frameworks & projects`,
    description: SITE.description,
    site: context.site!,
    items,
    customData: '<language>en</language>',
  });
}
