import { mergeAttributes } from "@tiptap/react"
import TiptapHorizontalRule from "@tiptap/extension-horizontal-rule"

export const HorizontalRule = TiptapHorizontalRule.extend({
  parseHTML() {
    return [
      {
        tag: 'hr',
        getAttrs: (node) => {
          if (
            node?.hasAttribute?.('data-page-break') ||
            node?.classList?.contains?.('memo-page-break-rule')
          ) {
            return false;
          }
          return null;
        },
      },
      {
        tag: 'div[data-type="horizontalRule"]',
      },
    ];
  },
  renderHTML() {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, { "data-type": this.name }),
      ["hr"],
    ]
  },
})

export default HorizontalRule
