export interface Props {
  title: string
}
export default function MarkDownHeader({ title }: Props) {
  return (
    <div className="flex justify-center mt-3">
      <p className="text-gray-400">{title}</p>
    </div>
  )
}
