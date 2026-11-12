"use client";
import { forwardRef, useCallback, useState } from "react"

import { ChevronDownIcon } from "@/components/tiptap-icons/chevron-down-icon"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuGroup,
} from "@/components/tiptap-ui-primitive/dropdown-menu"

const SIZES = [
   { label: '12pt', value: '12pt' },
   { label: '13pt', value: '13pt' },
   { label: '14pt', value: '14pt' },
   { label: '16pt', value: '16pt' },
   { label: '18pt', value: '18pt' },
   { label: '20pt', value: '20pt' },
   { label: '24pt', value: '24pt' },
];

export const FontSizeDropdownMenu = forwardRef((
   {
      editor: providedEditor,
      modal = false,
      ...buttonProps
   },
   ref
) => {
   const { editor } = useTiptapEditor(providedEditor)
   const [isOpen, setIsOpen] = useState(false)

   const handleOpenChange = useCallback(
      (open) => {
         if (!editor) return
         setIsOpen(open)
      },
      [editor]
   )

   if (!editor) {
      return null
   }

   const currentSize = SIZES.find(s => editor.isActive('textStyle', { fontSize: s.value }))?.label || 'Size'

   return (
      <DropdownMenu modal={modal} open={isOpen} onOpenChange={handleOpenChange}>
         <DropdownMenuTrigger asChild>
            <Button
               type="button"
               variant="ghost"
               role="button"
               tabIndex={-1}
               aria-label="Font Size"
               tooltip="Font Size"
               {...buttonProps}
               ref={ref}
            >
               <span className="text-sm font-medium px-1 truncate max-w-15">{currentSize}</span>
               <ChevronDownIcon className="tiptap-button-dropdown-small ml-1" />
            </Button>
         </DropdownMenuTrigger>

         <DropdownMenuContent align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
            <DropdownMenuGroup>
               {SIZES.map((size) => (
                  <DropdownMenuItem
                     key={size.value}
                     onSelect={() => editor.chain().focus().setFontSize(size.value).run()}
                     asChild
                  >
                     <Button
                        variant="ghost"
                        type="button"
                        role="menuitem"
                        data-active-state={editor.isActive('textStyle', { fontSize: size.value }) ? "on" : "off"}
                        className="w-full justify-start font-normal"
                     >
                        <span className="tiptap-button-text" style={{ fontSize: size.value }}>{size.label}</span>
                        {editor.isActive('textStyle', { fontSize: size.value }) && (
                           <span className="text-xs text-primary ml-auto">✓</span>
                        )}
                     </Button>
                  </DropdownMenuItem>
               ))}
               <DropdownMenuItem
                  onSelect={() => editor.chain().focus().unsetFontSize().run()}
                  asChild
               >
                  <Button
                     variant="ghost"
                     type="button"
                     role="menuitem"
                     className="w-full justify-start font-normal text-slate-500"
                  >
                     <span className="tiptap-button-text">Default Size</span>
                  </Button>
               </DropdownMenuItem>
            </DropdownMenuGroup>
         </DropdownMenuContent>
      </DropdownMenu>
   )
})

FontSizeDropdownMenu.displayName = "FontSizeDropdownMenu"

export default FontSizeDropdownMenu
