import { type HTMLAttributes } from 'react'

export function Direction({ dir = 'ltr', className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div dir={dir} className={className} {...props} />
}
