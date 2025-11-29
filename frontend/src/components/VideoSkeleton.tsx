export default function VideoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-800 aspect-video rounded-lg"></div>
      <div className="flex mt-3">
        <div className="w-10 h-10 bg-gray-800 rounded-full flex-shrink-0"></div>
        <div className="ml-3 flex-1">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-800 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  )
}
