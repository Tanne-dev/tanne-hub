import type { PostBodyBlock, PostBodyImageAlign } from "./postBody";

const blockShell =
  "admin-post-body-block theme-smooth rounded-md border border-[var(--admin-border)] bg-[var(--admin-inner-bg)] p-3 space-y-2";

export function createEmptyTextBlock(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = blockShell;
  wrap.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-label)]">Paragraph</span>
      <div class="flex gap-1">
        <button type="button" class="admin-body-move-up rounded border border-[var(--admin-input-border)] px-2 py-0.5 text-[10px] text-[var(--admin-subtle)] hover:bg-[var(--admin-tab-idle-hover)]">↑</button>
        <button type="button" class="admin-body-move-down rounded border border-[var(--admin-input-border)] px-2 py-0.5 text-[10px] text-[var(--admin-subtle)] hover:bg-[var(--admin-tab-idle-hover)]">↓</button>
        <button type="button" class="admin-body-remove rounded border border-[var(--admin-danger-border)] px-2 py-0.5 text-[10px] text-[var(--admin-danger-text)] hover:bg-red-500/10">Remove</button>
      </div>
    </div>
    <textarea class="admin-body-text min-h-[100px] w-full rounded border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2 py-2 text-sm text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" rows="5" placeholder="Write paragraph..."></textarea>
  `;
  return wrap;
}

export function buildImageBlockEl(init: {
  url: string;
  align: PostBodyImageAlign;
  caption?: string;
}): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = blockShell;
  wrap.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-label)]">Image</span>
      <div class="flex gap-1">
        <button type="button" class="admin-body-move-up rounded border border-[var(--admin-input-border)] px-2 py-0.5 text-[10px] text-[var(--admin-subtle)] hover:bg-[var(--admin-tab-idle-hover)]">↑</button>
        <button type="button" class="admin-body-move-down rounded border border-[var(--admin-input-border)] px-2 py-0.5 text-[10px] text-[var(--admin-subtle)] hover:bg-[var(--admin-tab-idle-hover)]">↓</button>
        <button type="button" class="admin-body-remove rounded border border-[var(--admin-danger-border)] px-2 py-0.5 text-[10px] text-[var(--admin-danger-text)] hover:bg-red-500/10">Remove</button>
      </div>
    </div>
    <label class="mb-1 block text-[11px] text-[var(--admin-subtle)]">Upload image (or keep URL below)</label>
    <input type="file" accept="image/*" class="admin-body-file mb-2 w-full rounded border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs text-[var(--admin-input-text)] file:mr-2 file:rounded file:border-0 file:bg-[var(--admin-accent)] file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-[var(--admin-submit-text)]" />
    <input type="text" class="admin-body-image-url mb-1 w-full rounded border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" placeholder="Image URL (or upload above)" />
    <label class="mb-1 block text-[11px] text-[var(--admin-subtle)]">Layout</label>
    <select class="admin-body-align mb-2 w-full rounded border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs text-[var(--admin-input-text)] outline-none focus:border-[var(--admin-accent)]"></select>
    <input type="text" class="admin-body-caption w-full rounded border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] px-2 py-1.5 text-xs text-[var(--admin-input-text)] outline-none placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)]" placeholder="Caption (optional)" />
  `;

  const sel = wrap.querySelector<HTMLSelectElement>(".admin-body-align")!;
  for (const opt of [
    { v: "full", t: "Full width" },
    { v: "center", t: "Center (medium)" },
    { v: "left", t: "Float left" },
    { v: "right", t: "Float right" },
  ] as const) {
    const o = document.createElement("option");
    o.value = opt.v;
    o.textContent = opt.t;
    sel.appendChild(o);
  }

  wrap.querySelector<HTMLInputElement>(".admin-body-image-url")!.value = init.url;
  sel.value = init.align;
  wrap.querySelector<HTMLInputElement>(".admin-body-caption")!.value = init.caption ?? "";

  return wrap;
}

export function mountPostBodyBlocks(container: HTMLElement, blocks: PostBodyBlock[]): void {
  container.replaceChildren();
  for (const b of blocks) {
    if (b.type === "text") {
      const el = createEmptyTextBlock();
      el.querySelector<HTMLTextAreaElement>(".admin-body-text")!.value = b.text;
      container.appendChild(el);
    } else {
      container.appendChild(
        buildImageBlockEl({ url: b.url, align: b.align, caption: b.caption }),
      );
    }
  }
  if (container.children.length === 0) {
    container.appendChild(createEmptyTextBlock());
  }
}

export function moveBlockElement(block: HTMLElement, delta: number): void {
  const parent = block.parentElement;
  if (!parent) return;
  const idx = [...parent.children].indexOf(block);
  const next = idx + delta;
  if (next < 0 || next >= parent.children.length) return;
  const ref = parent.children[next];
  if (delta < 0) parent.insertBefore(block, ref);
  else parent.insertBefore(block, ref.nextSibling);
}

export function removeBlockElement(block: HTMLElement, container: HTMLElement): void {
  block.remove();
  if (container.children.length === 0) {
    container.appendChild(createEmptyTextBlock());
  }
}

export async function readPostBodyBlocksFromEditor(
  container: HTMLElement,
  uploadOne: (file: File) => Promise<{ ok: true; url: string } | { ok: false; error: string }>,
): Promise<{ ok: true; blocks: PostBodyBlock[] } | { ok: false; error: string }> {
  const blocks: PostBodyBlock[] = [];

  for (const child of [...container.children]) {
    const block = child as HTMLElement;
    if (!block.classList.contains("admin-post-body-block")) continue;

    const ta = block.querySelector<HTMLTextAreaElement>(".admin-body-text");
    if (ta) {
      blocks.push({ type: "text", text: ta.value });
      continue;
    }

    const urlInput = block.querySelector<HTMLInputElement>(".admin-body-image-url");
    const fileInput = block.querySelector<HTMLInputElement>(".admin-body-file");
    const alignSel = block.querySelector<HTMLSelectElement>(".admin-body-align");
    const capInput = block.querySelector<HTMLInputElement>(".admin-body-caption");
    if (!urlInput || !alignSel) continue;

    let url = urlInput.value.trim();
    const file = fileInput?.files?.[0];
    if (file) {
      const up = await uploadOne(file);
      if (!up.ok) return { ok: false, error: up.error };
      url = up.url;
      urlInput.value = url;
    }

    if (!url) {
      return { ok: false, error: "Image blocks require a URL or an uploaded file." };
    }

    const align = alignSel.value as PostBodyImageAlign;
    if (!["full", "center", "left", "right"].includes(align)) {
      return { ok: false, error: "Invalid image layout type." };
    }

    blocks.push({
      type: "image",
      url,
      align,
      caption: capInput?.value.trim() || undefined,
    });
  }

  return { ok: true, blocks };
}
