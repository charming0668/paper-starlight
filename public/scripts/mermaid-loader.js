import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

function isDarkMode() {
  return document.documentElement.dataset.theme === 'dark' ||
         (!('theme' in document.documentElement.dataset) && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

mermaid.initialize({
  startOnLoad: false,
  theme: isDarkMode() ? 'dark' : 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit'
});

async function renderMermaidDiagrams() {
  const blocks = document.querySelectorAll('pre[data-language="mermaid"]');
  let idx = 0;
  for (const block of blocks) {
    idx++;
    const lines = Array.from(block.querySelectorAll('.ec-line')).map(l => l.textContent);
    const rawCode = lines.length > 0 ? lines.join('\n') : (block.querySelector('code')?.innerText || block.innerText);
    if (!rawCode || !rawCode.trim()) continue;

    const container = document.createElement('div');
    container.className = 'mermaid-render my-6 flex justify-center p-4 bg-stone-900/30 dark:bg-stone-950/60 rounded-xl border border-stone-700/50 shadow-sm overflow-x-auto';
    const id = 'mermaid-svg-' + Date.now() + '-' + idx;
    
    try {
      const { svg } = await mermaid.render(id, rawCode.trim());
      container.innerHTML = svg;
      const parentFrame = block.closest('.expressive-code') || block;
      parentFrame.parentNode.insertBefore(container, parentFrame);
      parentFrame.style.display = 'none';
    } catch (err) {
      console.warn('Failed to render mermaid diagram:', err);
    }
  }
}

function renderCarousels() {
  const carouselBlocks = document.querySelectorAll('pre[data-language="carousel"]');
  carouselBlocks.forEach((block) => {
    const lines = Array.from(block.querySelectorAll('.ec-line')).map(l => l.textContent);
    const rawText = lines.length > 0 ? lines.join('\n') : (block.querySelector('code')?.innerText || block.innerText);
    
    const slidesData = [];
    const parts = rawText.split(/<!--\s*slide\s*-->/i);
    parts.forEach(part => {
      const match = part.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (match) {
        let src = match[2].trim();
        if (src.startsWith('figures/')) {
          src = '/paper-starlight/' + src;
        }
        slidesData.push({ alt: match[1].trim(), src: src });
      }
    });

    if (slidesData.length === 0) return;

    const carouselEl = document.createElement('div');
    carouselEl.className = 'custom-carousel my-6 border border-stone-800 rounded-2xl p-4 bg-stone-900/40 shadow-lg';
    let currentSlide = 0;

    function renderView() {
      carouselEl.innerHTML = `
        <div class="relative overflow-hidden rounded-xl bg-black/40 flex flex-col items-center justify-center min-h-[320px] p-4">
          <img src="${slidesData[currentSlide].src}" alt="${slidesData[currentSlide].alt}" style="max-height: 440px; width: auto; object-fit: contain; border-radius: 8px;" />
          <div style="margin-top: 12px; font-size: 13px; color: #cbd5e1; padding: 4px 12px; background: rgba(30, 41, 59, 0.85); border-radius: 9999px; border: 1px solid rgba(71, 85, 105, 0.5);">
            ${slidesData[currentSlide].alt} (${currentSlide + 1} / ${slidesData.length})
          </div>

          <!-- Prev/Next buttons -->
          <button class="prev-btn" style="position: absolute; left: 12px; top: 45%; transform: translateY(-50%); background: rgba(30, 41, 59, 0.9); color: white; border: 1px solid #64748b; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
            ❮
          </button>
          <button class="next-btn" style="position: absolute; right: 12px; top: 45%; transform: translateY(-50%); background: rgba(30, 41, 59, 0.9); color: white; border: 1px solid #64748b; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
            ❯
          </button>
        </div>

        <!-- Dot indicators -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 12px;">
          ${slidesData.map((_, i) => `
            <button class="dot-btn" data-index="${i}" style="width: 10px; height: 10px; border-radius: 50%; border: none; cursor: pointer; transition: all 0.2s; background: ${i === currentSlide ? '#818cf8' : '#475569'};"></button>
          `).join('')}
        </div>
      `;

      carouselEl.querySelector('.prev-btn').onclick = (e) => {
        e.preventDefault();
        currentSlide = (currentSlide - 1 + slidesData.length) % slidesData.length;
        renderView();
      };
      carouselEl.querySelector('.next-btn').onclick = (e) => {
        e.preventDefault();
        currentSlide = (currentSlide + 1) % slidesData.length;
        renderView();
      };
      carouselEl.querySelectorAll('.dot-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          currentSlide = parseInt(btn.dataset.index);
          renderView();
        };
      });
    }

    renderView();

    const parentFrame = block.closest('.expressive-code') || block;
    parentFrame.parentNode.insertBefore(carouselEl, parentFrame);
    parentFrame.style.display = 'none';
  });
}

function initAll() {
  renderMermaidDiagrams();
  renderCarousels();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

document.addEventListener('astro:page-load', initAll);
