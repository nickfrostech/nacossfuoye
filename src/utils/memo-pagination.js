/**
 * Utilities for multi-sheet memo pagination.
 * Memos that exceed single A4 letterhead bounds are split across sheets.
 * Supports both TipTap `<hr data-page-break="true" />` nodes and HTML comment `<!-- pagebreak -->`.
 */

export const PAGE_BREAK_COMMENT = '<!-- pagebreak -->';
export const PAGE_BREAK_MARKER = '<hr data-page-break="true" class="memo-page-break-rule" />';

// Matches explicit page break comments or hr/div tags with data-page-break or memo-page-break-rule
export const PAGE_BREAK_REGEX = /<!--\s*pagebreak\s*-->|<hr[^>]*(?:data-page-break|memo-page-break-rule)[^>]*\/?>|<div[^>]*(?:data-page-break|pageBreak)[^>]*>.*?<\/div>/i;

export const SAFE_PRINT_HEIGHTS = {
   executive: 745,
   src: 755,
   elecom: 700,
   president: 765,
};

/**
 * Splits HTML content into array of pages.
 * @param {string} html 
 * @returns {string[]} Array of page HTML strings
 */
export function splitMemoContent(html) {
   if (!html || typeof html !== 'string') return [''];

   if (PAGE_BREAK_REGEX.test(html)) {
      const parts = html.split(PAGE_BREAK_REGEX).map(p => p.trim());
      return parts.map(p => (p ? p : '<p></p>'));
   }

   return [html];
}

/**
 * Joins an array of page contents into a single HTML string with page breaks.
 * @param {string[]} pages 
 * @returns {string} Combined HTML
 */
export function joinMemoPages(pages) {
   if (!Array.isArray(pages) || pages.length === 0) return '';
   return pages
      .map(p => (p && typeof p === 'string' && p.trim() ? p.trim() : '<p></p>'))
      .join(PAGE_BREAK_MARKER);
}

/**
 * Splits a single DOM element (e.g. paragraph) into two valid elements at targetCharOffset,
 * snapping to the nearest sentence end (. ! ?) or word boundary.
 */
function splitElementAtTextOffset(blockEl, targetCharOffset) {
   const text = blockEl.textContent || '';
   if (text.length <= 20) {
      return [blockEl.outerHTML, ''];
   }

   // 1. Search for clean sentence boundary within ±120 chars
   let splitIndex = targetCharOffset;
   const searchStart = Math.max(0, targetCharOffset - 120);
   const searchEnd = Math.min(text.length, targetCharOffset + 80);
   const windowText = text.substring(searchStart, searchEnd);

   const sentenceEndRegex = /[.!?](\s+)/g;
   let bestSentenceDiff = Infinity;
   let bestSentencePos = -1;
   let match;

   while ((match = sentenceEndRegex.exec(windowText)) !== null) {
      const pos = searchStart + match.index + match[0].length;
      const diff = Math.abs(pos - targetCharOffset);
      if (diff < bestSentenceDiff) {
         bestSentenceDiff = diff;
         bestSentencePos = pos;
      }
   }

   if (bestSentencePos !== -1 && bestSentenceDiff < 140) {
      splitIndex = bestSentencePos;
   } else {
      // 2. Search for clean word boundary (space) before targetCharOffset
      const lastSpace = text.lastIndexOf(' ', targetCharOffset);
      if (lastSpace > targetCharOffset - 60 && lastSpace > 0) {
         splitIndex = lastSpace + 1;
      }
   }

   splitIndex = Math.max(1, Math.min(text.length - 1, splitIndex));

   // 3. Split DOM tree using TreeWalker and Range on element
   const doc = blockEl.ownerDocument || document;
   const walker = doc.createTreeWalker(blockEl, NodeFilter.SHOW_TEXT);
   let accumulated = 0;
   let targetNode = null;
   let targetOffsetInNode = 0;

   let textNode;
   while ((textNode = walker.nextNode())) {
      const len = textNode.nodeValue.length;
      if (accumulated + len >= splitIndex) {
         targetNode = textNode;
         targetOffsetInNode = Math.max(0, Math.min(len, splitIndex - accumulated));
         break;
      }
      accumulated += len;
   }

   if (!targetNode) {
      return [blockEl.outerHTML, ''];
   }

   try {
      const range1 = doc.createRange();
      range1.setStart(blockEl, 0);
      range1.setEnd(targetNode, targetOffsetInNode);
      const part1Frag = range1.cloneContents();

      const range2 = doc.createRange();
      range2.setStart(targetNode, targetOffsetInNode);
      range2.setEndAfter(blockEl.lastChild || targetNode);
      const part2Frag = range2.cloneContents();

      const clone1 = blockEl.cloneNode(false);
      clone1.appendChild(part1Frag);

      const clone2 = blockEl.cloneNode(false);
      clone2.appendChild(part2Frag);

      return [clone1.outerHTML, clone2.outerHTML];
   } catch (err) {
      console.warn('Range split fallback:', err);
      const t1 = text.substring(0, splitIndex);
      const t2 = text.substring(splitIndex);
      const c1 = blockEl.cloneNode(false);
      const c2 = blockEl.cloneNode(false);
      c1.textContent = t1;
      c2.textContent = t2;
      return [c1.outerHTML, c2.outerHTML];
   }
}

/**
 * Performs an accurate split of an overflowing HTML document along the physical printable height boundary.
 * Sheet 1 keeps all content up to where the printable height stopped; only the overflowing portion moves to Sheet 2.
 * @param {string} html 
 * @param {HTMLElement|null} letterHeadEl - Live DOM letterhead element for exact measurement
 * @param {string|number} memoTypeOrHeight - Memo type string (e.g. 'executive') or safe height number
 * @returns {string[]} [page1Html, page2Html]
 */
export function smartSplitContent(html, letterHeadEl = null, memoTypeOrHeight = 'executive') {
   if (typeof window === 'undefined' || !html) return [html || '', ''];

   const safePrintHeight = typeof memoTypeOrHeight === 'number'
      ? memoTypeOrHeight
      : (SAFE_PRINT_HEIGHTS[memoTypeOrHeight] || 745);

   try {
      const containerDiv = document.createElement('div');
      containerDiv.innerHTML = html.trim();
      const blocks = Array.from(containerDiv.children);

      if (blocks.length === 0) {
         return [html, '<p></p>'];
      }

      // Calculate the exact proportion of content that fits on Sheet 1
      let targetRatio = 0.85; // default fallback: 85% on Sheet 1

      // 1. Physical measurement via live DOM letterhead container
      if (letterHeadEl && typeof letterHeadEl.querySelector === 'function') {
         const contentEl = letterHeadEl.querySelector('.memo-letterhead-content');
         if (contentEl && contentEl.scrollHeight > 0) {
            const clientH = contentEl.clientHeight || safePrintHeight;
            const scrollH = contentEl.scrollHeight;

            if (scrollH > clientH) {
               // Leave a 15px safety buffer so Sheet 1 never overflows
               targetRatio = Math.min(0.96, Math.max(0.15, (clientH - 15) / scrollH));
            }
         }
      } else {
         // Fallback ratio based on character estimation (~2100 chars capacity at 14pt)
         const totalChars = blocks.reduce((acc, b) => acc + (b.textContent || '').length, 0);
         const sheetCapacity = 2100;
         if (totalChars > sheetCapacity) {
            targetRatio = Math.min(0.95, Math.max(0.2, sheetCapacity / totalChars));
         }
      }

      const totalChars = blocks.reduce((acc, b) => acc + (b.textContent || '').length, 0);
      const targetChars = Math.max(50, Math.floor(totalChars * targetRatio));

      // Find the block that crosses targetChars
      let accumulated = 0;
      let splitBlockIndex = -1;
      let charsBeforeBlock = 0;

      for (let i = 0; i < blocks.length; i++) {
         const bLen = (blocks[i].textContent || '').length;
         if (accumulated + bLen >= targetChars) {
            splitBlockIndex = i;
            charsBeforeBlock = accumulated;
            break;
         }
         accumulated += bLen;
      }

      if (splitBlockIndex === -1) {
         splitBlockIndex = Math.max(0, blocks.length - 1);
         charsBeforeBlock = totalChars - (blocks[splitBlockIndex].textContent || '').length;
      }

      const targetBlock = blocks[splitBlockIndex];
      const targetBlockLen = (targetBlock.textContent || '').length;
      const charsInTargetForSheet1 = targetChars - charsBeforeBlock;
      const charsInTargetForSheet2 = targetBlockLen - charsInTargetForSheet1;

      // Check whether to split inside targetBlock or between blocks:
      // If targetBlock has <60 chars fitting on Sheet 1 and it's not the only block:
      if (charsInTargetForSheet1 < 60 && splitBlockIndex > 0) {
         const p1 = blocks.slice(0, splitBlockIndex).map(b => b.outerHTML).join('');
         const p2 = blocks.slice(splitBlockIndex).map(b => b.outerHTML).join('');
         return [p1 || '<p></p>', p2 || '<p></p>'];
      }

      // If targetBlock has <60 chars overflowing and it's not the last block:
      if (charsInTargetForSheet2 < 60 && splitBlockIndex < blocks.length - 1) {
         const p1 = blocks.slice(0, splitBlockIndex + 1).map(b => b.outerHTML).join('');
         const p2 = blocks.slice(splitBlockIndex + 1).map(b => b.outerHTML).join('');
         return [p1 || '<p></p>', p2 || '<p></p>'];
      }

      // Otherwise, split INSIDE targetBlock at the exact sentence/word boundary
      const [blockPart1, blockPart2] = splitElementAtTextOffset(targetBlock, charsInTargetForSheet1);

      const p1Blocks = blocks.slice(0, splitBlockIndex).map(b => b.outerHTML);
      if (blockPart1) p1Blocks.push(blockPart1);

      const p2Blocks = [];
      if (blockPart2) p2Blocks.push(blockPart2);
      p2Blocks.push(...blocks.slice(splitBlockIndex + 1).map(b => b.outerHTML));

      return [
         p1Blocks.join('') || '<p></p>',
         p2Blocks.join('') || '<p></p>'
      ];
   } catch (e) {
      console.warn('smartSplitContent failed:', e);
      return [html, '<p></p>'];
   }
}
