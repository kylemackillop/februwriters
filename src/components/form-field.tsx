'use client'

interface FormFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}

export default function FormField({ label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-feb-slate tracking-wide">
        {label}
        {required && <span className="text-feb-gold ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-feb-bluegray">{hint}</p>
      ) : null}
    </div>
  )
}
