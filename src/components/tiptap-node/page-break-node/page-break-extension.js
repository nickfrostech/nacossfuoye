import { Node, mergeAttributes } from '@tiptap/core';

export const PageBreak = Node.create({
   name: 'pageBreak',
   group: 'block',
   selectable: true,
   draggable: false,
   priority: 1000,

   parseHTML() {
      return [
         { tag: 'hr[data-page-break]' },
         { tag: 'div[data-page-break]' },
         { tag: 'hr.memo-page-break-rule' },
         { tag: 'div.memo-page-break-rule' },
         { tag: 'div[data-type="pageBreak"]' },
      ];
   },

   renderHTML({ HTMLAttributes }) {
      return [
         'hr',
         mergeAttributes(HTMLAttributes, {
            'data-page-break': 'true',
            class: 'memo-page-break-rule',
         }),
      ];
   },

   addCommands() {
      return {
         setPageBreak: () => ({ chain }) => {
            return chain()
               .insertContent({ type: this.name })
               .run();
         },
      };
   },

   addKeyboardShortcuts() {
      return {
         'Mod-Enter': () => this.editor.commands.setPageBreak(),
      };
   },
});

export default PageBreak;

