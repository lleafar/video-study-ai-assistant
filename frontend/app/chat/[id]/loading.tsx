export default function Loading() {
  return (
    <div className="h-screen bg-red-600 flex-1 flex flex-col">
      <div className="flex-1 overflow-hidden grid grid-cols-2 grid-rows-1 gap-0">
        {/* Video Player Skeleton */}
        <div className="flex justify-center w-full h-auto bg-black">
          <div className="w-full max-w-4xl aspect-video bg-zinc-800/50 animate-pulse m-4 rounded-lg" />
        </div>

        {/* Chat Skeleton */}
        <div className="w-full h-full flex flex-col p-6 space-y-4">
          {/* Header Skeleton */}
          <div className="animate-pulse space-y-2">
            <div className="h-6 w-3/4 bg-zinc-700/50 rounded" />
            <div className="h-4 w-1/2 bg-zinc-700/30 rounded" />
          </div>

          {/* Messages Skeleton */}
          <div className="flex-1 space-y-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex animate-pulse ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`h-16 rounded-2xl ${
                    i % 2 === 0
                      ? "w-3/4 bg-blue-600/20"
                      : "w-2/3 bg-zinc-700/50"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Input Skeleton */}
          <div className="animate-pulse">
            <div className="h-14 bg-zinc-700/50 rounded-full" />
          </div>
        </div>
      </div>

      {/* Switch Layout Button Skeleton */}
      <div className="absolute bottom-5 right-5">
        <div className="w-12 h-12 bg-zinc-700/50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}