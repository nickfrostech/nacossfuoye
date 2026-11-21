"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { FindAndReplace } from "@tiptap/extension-find-and-replace"
import { Selection } from "@tiptap/extensions"
import { FontFamily } from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import FontSize from 'tiptap-extension-font-size'
import Placeholder from '@tiptap/extension-placeholder'

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
   Toolbar,
   ToolbarGroup,
   ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { PageBreak } from "@/components/tiptap-node/page-break-node/page-break-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { FontFamilyDropdownMenu } from "@/components/tiptap-ui/font-family-dropdown-menu"
import { FontSizeDropdownMenu } from "@/components/tiptap-ui/font-size-dropdown-menu"
import { TextTransformDropdownMenu } from "@/components/tiptap-ui/text-transform-dropdown-menu"
import { TextTransform } from "@/components/tiptap-node/text-transform/text-transform"
import {
   ColorHighlightPopover,
   ColorHighlightPopoverContent,
   ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover"
import {
   LinkPopover,
   LinkContent,
   LinkButton,
} from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { ClearFormattingButton } from "@/components/tiptap-ui/clear-formatting-button"
import {
   SearchAndReplace,
   SearchAndReplaceButton,
} from "@/components/tiptap-ui/search-and-replace"

// --- Icons ---
import { ArrowLeftIcon } from "@/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/components/tiptap-icons/link-icon"
import { ChevronLeft, ChevronRight } from "lucide-react"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Components ---
import { ThemeToggle } from "@/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/components/tiptap-templates/simple/simple-editor.scss"

// import content from "@/components/tiptap-templates/simple/data/content.json"

const SEARCH_AND_REPLACE_SCROLL_OPTIONS = {
   block: "center",
}

const MainToolbarContent = ({
   onHighlighterClick,
   onLinkClick,
   onSearchAndReplaceClick,
   isSearchAndReplaceOpen,
   searchAndReplaceButtonRef,
   isMobile
}) => {
   return (
      <>
         <Spacer />

         <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
            <ClearFormattingButton />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <FontFamilyDropdownMenu />
            <FontSizeDropdownMenu />
            <TextTransformDropdownMenu />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="underline" />
            <MarkButton type="strike" />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <ListDropdownMenu
               modal={false}
               types={["bulletList", "orderedList", "taskList"]}
            />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            {!isMobile ? (
               <ColorHighlightPopover />
            ) : (
               <ColorHighlightPopoverButton onClick={onHighlighterClick} />
            )}
            {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <MarkButton type="superscript" />
            <MarkButton type="subscript" />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <BlockquoteButton />
            <MarkButton type="code" />
            <CodeBlockButton />
         </ToolbarGroup>

         <ToolbarSeparator />

         <ToolbarGroup>
            <ImageUploadButton />
         </ToolbarGroup>

         <Spacer />

         {isMobile && <ToolbarSeparator />}

         <ToolbarGroup>
            <SearchAndReplaceButton
               ref={searchAndReplaceButtonRef}
               aria-expanded={isSearchAndReplaceOpen}
               data-active-state={isSearchAndReplaceOpen ? "on" : "off"}
               onClick={onSearchAndReplaceClick}
            />
         </ToolbarGroup>
      </>
   )
}

const MobileToolbarContent = ({
   type,
   onBack
}) => (
   <>
      <ToolbarGroup>
         <Button variant="ghost" onClick={onBack}>
            <ArrowLeftIcon className="tiptap-button-icon" />
            {type === "highlighter" ? (
               <HighlighterIcon className="tiptap-button-icon" />
            ) : (
               <LinkIcon className="tiptap-button-icon" />
            )}
         </Button>
      </ToolbarGroup>

      <ToolbarSeparator />

      {type === "highlighter" ? (
         <ColorHighlightPopoverContent />
      ) : (
         <LinkContent />
      )}
   </>
)

export function SimpleEditor({ content, setContent, mode = 'split', toolbarPortalRef, isActive = true, onFocus }) {
   const isMobile = useIsBreakpoint()
   const [mobileView, setMobileView] = useState("main")
   const [isSearchAndReplaceOpen, setIsSearchAndReplaceOpen] = useState(false)
   const toolbarRef = useRef(null)
   const searchAndReplaceButtonRef = useRef(null)
   const [portalTarget, setPortalTarget] = useState(null)

   useEffect(() => {
      if (mode === 'document') {
         setPortalTarget(toolbarPortalRef?.current || document.getElementById('toolbar-portal-target'))
      }
   }, [mode, toolbarPortalRef])

   // We use a ref to prevent unnecessary state loops
   const contentRef = useRef(content);

   const editor = useEditor({
      immediatelyRender: false,
      editorProps: {
         attributes: {
            autocomplete: "off",
            autocorrect: "off",
            autocapitalize: "off",
            spellcheck: "true",
            "aria-label": "Main content area, start typing to enter text.",
            class: "simple-editor",
         },
         handleScrollTo: () => {
            // Suppress browser/ProseMirror auto-scrolling container in letterhead document mode
            // to ensure top text never scrolls out of view
            return mode === 'document';
         },
      },
      onFocus: () => {
         if (onFocus) onFocus();
      },
      extensions: [
         StarterKit.configure({
            horizontalRule: false,
            link: {
               openOnClick: false,
               enableClickSelection: true,
            },
         }),
         HorizontalRule,
         PageBreak,
         TextAlign.configure({ types: ["heading", "paragraph"] }),
         TaskList,
         TaskItem.configure({ nested: true }),
         Highlight.configure({ multicolor: true }),
         Image,
         Typography,
         Superscript,
         Subscript,
         Selection,
         TextStyle,
         FontFamily,
         FontSize,
         TextTransform,
         Placeholder.configure({
            placeholder: 'Start writing here...',
            emptyEditorClass: 'is-editor-empty',
         }),
         FindAndReplace.configure({
            searchDebounceMs: 500,
            injectCSS: false,
         }),
         ImageUploadNode.configure({
            accept: "image/*",
            maxSize: MAX_FILE_SIZE,
            limit: 3,
            upload: handleImageUpload,
            onError: (error) => console.error("Upload failed:", error),
         }),
      ],
      content,
      onUpdate: ({ editor }) => {
         const html = editor.getHTML();
         contentRef.current = html;
         if (setContent) setContent(html);
      },
   })

   useEffect(() => {
      if (editor && content !== contentRef.current) {
         contentRef.current = content;
         editor.commands.setContent(content);
      }
   }, [content, editor]);

   useEffect(() => {
      if (!isMobile && mobileView !== "main") {
         setMobileView("main")
      }
   }, [isMobile, mobileView])

   const openSearchAndReplace = useCallback(() => {
      setMobileView("main")
      setIsSearchAndReplaceOpen(true)
   }, [])

   const closeSearchAndReplace = useCallback(() => {
      setIsSearchAndReplaceOpen(false)
      searchAndReplaceButtonRef.current?.focus()
   }, [])

   const toggleSearchAndReplace = useCallback(() => {
      if (isSearchAndReplaceOpen) {
         closeSearchAndReplace()
         return
      }

      openSearchAndReplace()
   }, [closeSearchAndReplace, isSearchAndReplaceOpen, openSearchAndReplace])

   const scrollToolbarLeft = (e) => {
      e?.preventDefault()
      e?.stopPropagation()
      if (toolbarRef.current) {
         toolbarRef.current.scrollBy({ left: -220, behavior: "smooth" })
      }
   }

   const scrollToolbarRight = (e) => {
      e?.preventDefault()
      e?.stopPropagation()
      if (toolbarRef.current) {
         toolbarRef.current.scrollBy({ left: 220, behavior: "smooth" })
      }
   }

   const renderToolbar = () => (
      <div className="relative w-full flex items-center bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden group/toolbar">
         <button
            type="button"
            tabIndex={-1}
            onClick={scrollToolbarLeft}
            aria-label="Scroll toolbar left"
            title="Scroll toolbar left"
            className="shrink-0 h-10 px-2 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition z-10 cursor-pointer border-r border-slate-100"
         >
            <ChevronLeft className="w-4 h-4" />
         </button>

         <div className="flex-1 min-w-0 overflow-hidden">
            <Toolbar
               ref={toolbarRef}
               className="w-full bg-white shadow-none border-b-0"
            >
               {mobileView === "main" ? (
                  <MainToolbarContent
                     onHighlighterClick={() => setMobileView("highlighter")}
                     onLinkClick={() => setMobileView("link")}
                     onSearchAndReplaceClick={toggleSearchAndReplace}
                     isSearchAndReplaceOpen={isSearchAndReplaceOpen}
                     searchAndReplaceButtonRef={searchAndReplaceButtonRef}
                     isMobile={isMobile}
                  />
               ) : (
                  <MobileToolbarContent
                     type={mobileView === "highlighter" ? "highlighter" : "link"}
                     onBack={() => setMobileView("main")}
                  />
               )}
            </Toolbar>
         </div>

         <button
            type="button"
            tabIndex={-1}
            onClick={scrollToolbarRight}
            aria-label="Scroll toolbar right"
            title="Scroll toolbar right"
            className="shrink-0 h-10 px-2 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition z-10 cursor-pointer border-l border-slate-100"
         >
            <ChevronRight className="w-4 h-4" />
         </button>
      </div>
   )

   const editorContextValue = useMemo(() => ({ editor }), [editor])

   return (
      <div className={`simple-editor-wrapper relative ${mode === 'document' ? 'document-mode' : 'split-mode'}`}>
         <EditorContext.Provider value={editorContextValue}>
            {mode === 'document' 
               ? (portalTarget && isActive ? createPortal(renderToolbar(), portalTarget) : null)
               : renderToolbar()
            }

            <SearchAndReplace
               className="simple-editor-search-and-replace"
               open={isSearchAndReplaceOpen}
               onOpen={openSearchAndReplace}
               onClose={closeSearchAndReplace}
               scrollIntoViewOptions={SEARCH_AND_REPLACE_SCROLL_OPTIONS}
            />

            <EditorContent
               editor={editor}
               role="presentation"
               className="simple-editor-content"
            />
         </EditorContext.Provider>
      </div>
   )
}
