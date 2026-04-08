'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UploadDialog from '@/components/upload-dialog'

export default function UploadDialogDesktopTrigger({ today }: { today: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-feb-gold rounded-lg px-4 py-3 flex items-center gap-4 hover:bg-feb-gold-light transition-colors"
      >
        <div className="text-left">
          <p className="text-sm font-bold text-feb-slate">Submit day {today}</p>
          <p className="text-[10px] text-feb-slate/60">Until midnight your time</p>
        </div>
        <span className="border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-feb-slate block" />
      </button>
      <UploadDialog
        open={open}
        onOpenChange={setOpen}
        dayNumber={today}
        date={`February ${today}`}
        onSuccess={() => { setOpen(false); router.refresh() }}
      />
    </>
  )
}
