"use client";
import { forwardRef } from "react";
import { SplitSquareVertical } from "lucide-react";

import { useTiptapEditor } from "@/hooks/use-tiptap-editor";
import { Button } from "@/components/tiptap-ui-primitive/button";

export const PageBreakButton = forwardRef((
   {
      editor: providedEditor,
      children,
      onInsertPageBreak,
      ...buttonProps
   },
   ref
) => {
   const { editor } = useTiptapEditor(providedEditor);

   if (!editor) {
      return null;
   }

   const handlePageBreak = () => {
      if (editor.commands.setPageBreak) {
         editor.commands.setPageBreak();
      } else {
         editor.chain().focus().setHorizontalRule().run();
      }
      if (onInsertPageBreak) {
         onInsertPageBreak();
      }
   };

   return (
      <Button
         type="button"
         variant="ghost"
         role="button"
         tabIndex={-1}
         aria-label="Insert Page Break (Ctrl+Enter)"
         tooltip="Insert Page Break (Ctrl+Enter)"
         onClick={handlePageBreak}
         {...buttonProps}
         ref={ref}
      >
         {children ?? <SplitSquareVertical className="tiptap-button-icon" />}
      </Button>
   );
});

PageBreakButton.displayName = "PageBreakButton";

export default PageBreakButton;

