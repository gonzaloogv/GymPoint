import type { ReactNode } from "react"

type Props = { children: ReactNode }

export const Main = ({ children }: Props) => {
  return (
    <main className="min-h-screen space-y-6 mt-20">
      {children}
    </main>
  )
};
