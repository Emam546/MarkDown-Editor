import ActionButton, { Props as ActionProps } from './ActionButton'
import { faFileCirclePlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
export interface Props extends ActionProps {}
export default function NewNoteButton({ ...props }: Props) {
  return (
    <ActionButton {...props}>
      <FontAwesomeIcon className="text-zinc-300" icon={faFileCirclePlus} />
    </ActionButton>
  )
}
