import { Suspense } from "react"
import CommuteRankApp from "@/components/commute-rank-app"
import { Loader } from "@/components/ui/loader"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b bg-white p-4 shadow-sm">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">CommuteRank</h1>
          <p className="text-sm text-muted-foreground">Find apartments with reliable MBTA access</p>
        </div>
      </header>

      <Suspense fallback={<Loader className="flex-1 flex items-center justify-center" />}>
        <CommuteRankApp />
      </Suspense>
    </main>
  )
}

