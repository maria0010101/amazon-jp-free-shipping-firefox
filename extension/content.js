/* Independently implemented from observed behavior; upstream provenance: docs/SOURCE.md. */
(() => {
  "use strict";
  const selector = [
    '.s-result-item[data-component-type="s-search-result"]',
    '.s-result-item[data-asin]:not([data-asin=""])',
    '.a-carousel-card', '.ad-item', '.udm-primary-delivery-message', '.puis-card-container'
  ].join(',');
  const free = /無料\s*配送|配送\s*無料|送料\s*無料|무료\s*배송|배송\s*무료|免费配送|免运费|免費配送|免費運送|免運費|免運|free\s+(?:shipping|delivery)/iu;
  const negative = /not\s+(?:eligible\s+for\s+)?free\s+(?:shipping|delivery)|no\s+free\s+(?:shipping|delivery)|不(?:提供|適用|适用|享有)?免運|非免運|非免费配送|非免費配送|無料配送対象外|送料無料対象外/giu;
  const marked = 'ajfs-free-shipping';
  function scan() {
    document.querySelectorAll(selector).forEach(card => {
      // Exclude headings and product names to avoid treating "free shipping" in a title as an offer.
      const copy = card.cloneNode(true);
      copy.querySelectorAll('h2, [data-cy="title-recipe"], .a-size-base-plus.a-text-normal, script, style').forEach(n => n.remove());
      const text = (copy.textContent || '').normalize('NFKC').replace(/\s+/g, ' ').replace(negative, '');
      card.classList.toggle(marked, free.test(text));
    });
  }
  let timer = null;
  const schedule = () => {
    // Coalesce a burst without postponing indefinitely on pages with continuous updates.
    if (timer !== null) return;
    timer = setTimeout(() => { timer = null; scan(); }, 160);
  };
  scan();
  // CSS class updates are intentionally not observed (no self-triggered mutation loop).
  new MutationObserver(schedule).observe(document.body, {
    childList: true, characterData: true, subtree: true
  });
})();
