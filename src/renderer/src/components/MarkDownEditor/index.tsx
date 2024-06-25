'use client'
import { useEffect, useRef } from 'react'
import {
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  MDXEditorProps,
  quotePlugin,
  thematicBreakPlugin,
} from '@mdxeditor/editor'
import { headingsPlugin } from '@mdxeditor/editor'
import MarkDownHeader from './header'
import { useAppSelector } from '@/hooks/store'

export default function MarkDownEditor({ ...props }: Omit<MDXEditorProps, 'markdown'>) {
  const activeId = useAppSelector((state) => state.notes.active)
  const notes = useAppSelector((state) => state.notes.notes)
  const activeNote = notes.find(({ id }) => id == activeId)
  const editorRef = useRef<MDXEditorMethods>(null)
  useEffect(() => {
    if (!activeNote) return

    window.api
      .getNoteData(activeNote.path)
      .then((data) => editorRef.current?.setMarkdown(data))
      .catch(() => editorRef.current?.setMarkdown(''))
      .finally(() => {
        editorRef.current?.focus()
      })
  }, [activeId])

  return (
    <div>
      {activeId == undefined ? null : (
        <>
          <MarkDownHeader title={activeNote?.title || ''} />
          <MDXEditor
            {...props}
            ref={editorRef}
            markdown={''}
            onChange={(data) => {
              if (!activeNote) return
              window.api.writeNoteData(activeNote.path, data)
            }}
            contentEditableClassName="outline-none max-w-none text-lg px-8 py-5 caret-yellow-500 prose prose-invert prose-p:my-3 prose-p:text-gray-100 prose-p:leading-relaxed prose-headings:my-4 prose-blockquote:my-4 prose-ul:my-2 prose-li:my-0 prose-code:px-1 prose-code:text-red-500 prose-code:before:content-[''] prose-code:after:content-['']"
            plugins={[
              headingsPlugin(),
              listsPlugin(),
              quotePlugin(),
              thematicBreakPlugin(),
              markdownShortcutPlugin()
            ]}
          />
        </>
      )}
    </div>
  )
}
