import {
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes
} from 'react'
import { Input } from './forms'
import { cn } from '../utils'

export function Accordion({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-2', className)} {...props} />
}

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDetailsElement>, 'title'> {
  title: React.ReactNode
}

export function AccordionItem({ className, title, children, ...props }: AccordionItemProps) {
  return (
    <details className={cn('rounded-xl border border-border bg-surface', className)} {...props}>
      <summary className="cursor-pointer p-4 font-semibold">{title}</summary>
      <div className="border-t border-border p-4">{children}</div>
    </details>
  )
}

export const Collapsible = AccordionItem

export interface ComboboxOption {
  readonly label: string
  readonly value: string
}

export interface ComboboxProps extends InputHTMLAttributes<HTMLInputElement> {
  options?: readonly ComboboxOption[]
}

export function Combobox({ options = [], list, ...props }: ComboboxProps) {
  const generatedId = useId()
  const listId = list ?? generatedId
  return (
    <>
      <Input list={listId} {...props} />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </datalist>
    </>
  )
}

export function Command({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CommandInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} />
}

export function CommandList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="listbox" className={cn('grid max-h-72 gap-1 overflow-auto', className)} {...props} />
  )
}

export function Carousel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex snap-x gap-4 overflow-x-auto', className)} {...props} />
}

export function Chart({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('min-h-64 rounded-xl border border-border bg-muted/40', className)}
      {...props}
    />
  )
}

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn('w-full border-collapse overflow-hidden rounded-xl', className)}
      {...props}
    />
  )
}

export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border', className)} {...props} />
}

export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'p-3 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-3 text-sm', className)} {...props} />
}

export const DataTable = Table
