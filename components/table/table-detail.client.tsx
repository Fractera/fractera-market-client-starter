"use client"
// @part table-detail — a table with the card of its chosen row: on a computer the page splits with shadcn Resizable (the table left,
// the card right, 50/50 by default, each side 30–70 %, a handle); on a phone (below md) the card slides in as a side Sheet 90 % wide.

import { type ReactNode, useSyncExternalStore } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

// The architect, 2026-11-27 (Telegram 1654, 1655): «по умолчанию … 50% но позволим делать диапазон от 30 до 70% … В мобильной версии
// просто выезжает ящик с шириной экрана 90%»; «Этот же макет будем использовать и для корзины и для купленных».
const WIDE = "(min-width: 768px)"

function subscribe(onChange: () => void) {
  const m = window.matchMedia(WIDE)
  m.addEventListener("change", onChange)
  return () => m.removeEventListener("change", onChange)
}
const wideNow = () => window.matchMedia(WIDE).matches
// The server and the first paint draw the computer's layout; a phone switches after hydration — the card is opened by a click anyway.
const wideOnServer = () => true

export function TableDetail({
  table,
  detail,
  open,
  onClose,
  title,
  description,
}: {
  /** The table — usually `<TableTools …/>`. */
  table: ReactNode
  /** The card of the chosen row, drawn only while `open`; it carries its own close (the drawer shows no second one). */
  detail: ReactNode
  open: boolean
  onClose: () => void
  /** The phone drawer's accessible title and line under it (the card itself carries its visible heading). */
  title: string
  description?: string
}) {
  const wide = useSyncExternalStore(subscribe, wideNow, wideOnServer)

  if (wide) {
    if (!open) return <div data-block="tdw0a">{table}</div>
    return (
      <ResizablePanelGroup data-block="tdg1b" orientation="horizontal" className="items-stretch">
        <ResizablePanel defaultSize="50%" minSize="30%" maxSize="70%">
          <div data-block="tdl2c" className="min-w-0 pr-4">{table}</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="50%" minSize="30%" maxSize="70%">
          <div data-block="tdr3d" className="min-w-0 pl-4">{detail}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    )
  }

  return (
    <>
      <div data-block="tdm4e">{table}</div>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" showCloseButton={false} className="w-[90vw] gap-0 overflow-y-auto p-0 sm:max-w-none">
          <SheetHeader className="sr-only">
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div data-block="tds5f" className="p-4">{detail}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
