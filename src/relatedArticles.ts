import { escapeHtml } from "./postBody";
import { getLocalizedPost, type NewsLanguage } from "./newsLanguage";
import type { PostItem } from "./postsStore";

const topics = ["arena", "mercurial", "poison", "tekteon", "provoke", "fusion", "fragment", "clan boss", "champion", "rebalance", "relic"];

export function selectRelatedArticles(current: PostItem, posts: PostItem[]): PostItem[] {
  const text = `${current.title} ${current.caption || ""}`.toLowerCase();
  const relevant = topics.filter((topic) => text.includes(topic));
  const score = (post: PostItem) => {
    const candidate = `${post.title} ${post.caption || ""}`.toLowerCase();
    return relevant.filter((topic) => candidate.includes(topic)).length;
  };
  return posts.filter((post) => post.id !== current.id)
    .sort((a, b) => score(b) - score(a) || b.createdAt - a.createdAt)
    .slice(0, 3);
}

export function renderRelatedArticles(current: PostItem, posts: PostItem[], lang: NewsLanguage): string {
  const related = selectRelatedArticles(current, posts);
  if (!related.length) return "";
  return `<section class="mt-8 border-t border-[var(--admin-border)] pt-5" aria-labelledby="related-heading">
    <h2 id="related-heading" class="text-xl font-bold text-[var(--news-card-text)]">${lang === "vi" ? "Đọc tiếp trên Tanne Hub" : "Keep exploring Tanne Hub"}</h2>
    <div class="mt-4 grid gap-3 sm:grid-cols-3">${related.map((post) => {
      const localized = getLocalizedPost(post, lang);
      return `<a data-analytics="related_article" href="/share/${encodeURIComponent(post.id)}?lang=${lang}" class="block rounded-xl border border-[var(--admin-border)] p-4 text-[var(--news-card-text)] transition hover:border-[#7fe9ff] focus-visible:outline-2 focus-visible:outline-[#7fe9ff]">
        <h3 class="font-bold leading-snug">${escapeHtml(localized.title)}</h3>
        ${localized.caption ? `<p class="mt-2 line-clamp-3 text-sm opacity-80">${escapeHtml(localized.caption)}</p>` : ""}
        <span class="mt-3 inline-block text-sm font-semibold">${lang === "vi" ? "Đọc bài →" : "Read guide →"}</span>
      </a>`;
    }).join("")}</div>
  </section>`;
}
