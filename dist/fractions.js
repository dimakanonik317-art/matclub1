/* Present simple written fractions as stacked fractions without changing stored answers. */
(() => {
  const targets = '#tasks .task-info, #lessonBody .lesson-content, #modalBody .problem-pane, #modalBody .work-panel, #aiMessages .ai-assistant .ai-prose, .search-page main, #labSection';
  const excluded = 'a,button,input,textarea,select,option,code,pre,kbd,samp,script,style,svg,math,.math-fraction,.input-note,.formula-help,.quick-form,[contenteditable]:not([contenteditable="false"])';
  // Both operands must be complete numbers, variables, or bracketed expressions.
  const fraction = /(^|[^\p{L}\p{N}_./])(\[[^\[\]\n]{1,100}\]|\((?:[^()\n]|\([^()\n]*\)){1,100}\)|[−-]?(?:\d+(?:[.,]\d+)?[a-zA-Zα-ωΑ-Ω]?|[a-zA-Zα-ωΑ-Ω][a-zA-Z0-9₀-₉]*)(?:\^[−-]?\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹])?)\s*\/\s*(\[[^\[\]\n]{1,100}\]|\((?:[^()\n]|\([^()\n]*\)){1,100}\)|[−-]?(?:\d+(?:[.,]\d+)?[a-zA-Zα-ωΑ-Ω]?|[a-zA-Zα-ωΑ-Ω][a-zA-Z0-9₀-₉]*)(?:\^[−-]?\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹])?)(?![\p{L}\p{N}_/]|\.(?=\d))/gu;
  function processText(node) {
    const parent = node.parentElement;
    if (!parent || !parent.closest(targets) || parent.closest(excluded) || !node.data.includes('/')) return;
    const value = node.data;
    fraction.lastIndex = 0;
    const matches = [...value.matchAll(fraction)];
    if (!matches.length) return;
    const fragment = document.createDocumentFragment();
    let end = 0;
    for (const match of matches) {
      const start = match.index + match[1].length;
      fragment.append(document.createTextNode(value.slice(end, start)));
      const numerator = match[2], denominator = match[3];
      const span = document.createElement('span');
      span.className = 'math-fraction';
      span.setAttribute('role', 'math');
      span.setAttribute('aria-label', numerator + ' делить на ' + denominator);
      const top = document.createElement('span'), bottom = document.createElement('span');
      top.className = 'math-fraction-top'; bottom.className = 'math-fraction-bottom';
      top.setAttribute('aria-hidden', 'true'); bottom.setAttribute('aria-hidden', 'true');
      top.textContent = numerator; bottom.textContent = denominator;
      const slash = document.createElement('span'); slash.className = 'math-fraction-slash';
      slash.setAttribute('aria-hidden', 'true'); slash.textContent = '/';
      span.append(top, slash, bottom); fragment.append(span);
      end = match.index + match[0].length;
    }
    fragment.append(document.createTextNode(value.slice(end)));
    node.replaceWith(fragment);
  }
  function scan(node) {
    if (node.nodeType === Node.TEXT_NODE) { processText(node); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || node.closest(excluded)) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(processText);
  }
  document.querySelectorAll(targets).forEach(scan);
  const pending = new Set(); let scheduled = false;
  const flush = () => { scheduled = false; const nodes = [...pending]; pending.clear(); nodes.forEach(scan); };
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') pending.add(record.target);
      else for (const node of record.addedNodes) pending.add(node);
    }
    if (pending.size && !scheduled) { scheduled = true; requestAnimationFrame(flush); }
  });
  observer.observe(document.body, {subtree:true, childList:true, characterData:true});
})();
