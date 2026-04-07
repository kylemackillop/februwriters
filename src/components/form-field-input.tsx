'use client'

import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import FormField from '@/components/form-field'

interface FormFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  required?: boolean
}

export default function FormFieldInput({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: FormFieldInputProps) {
  return (
    <FormField label={label} error={error} hint={hint} required={required}>
      <Input
        className={cn(
          'bg-white border-feb-bluegray/30 focus-visible:ring-feb-gold text-feb-slate placeholder:text-feb-bluegray/50',
          error && 'border-red-400 focus-visible:ring-red-400',
          className
        )}
        {...props}
      />
    </FormField>
  )
}
