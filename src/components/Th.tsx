import { FC, ReactNode } from "react"

interface Props {
  children?: ReactNode,
  styles?: string,
}

export const Th: FC<Props> = ({ children, styles }) => {
  return (
    <div className={styles}>
      <p className="text-gray-500 xl:text-base leading-[16px] font-medium text-sm py-3">
        {children}
      </p>
    </div>
  )
}