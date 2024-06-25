import classNames from 'classnames'
import { ComponentProps } from 'react'
export interface Props extends ComponentProps<'button'> {}
function ActionButton({ className, children, ...props }: Props) {
  return (
    <button
      className={classNames(
        className,
        'bg-transparent px-2 py-1 rounded-md border border-zinc-400/50 hover:bg-zinc-500/50 transition-colors duration-100'
      )}
      {...props}
    >
      {children}
    </button>
  )
}
export default ActionButton
