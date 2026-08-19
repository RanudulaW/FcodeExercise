import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="hidden md:block col-span-1">
        <Sidebar />
      </div>
      
      <div className="col-span-1 md:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 mb-4">
          <p className="text-blue-900 font-medium">Start a post</p>
          <div className="mt-4 flex gap-4">
            <button className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors">
              <span className="text-blue-600 font-bold">Photo</span>
            </button>
            <button className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors">
              <span className="text-blue-600 font-bold">Video</span>
            </button>
            <button className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors">
              <span className="text-blue-600 font-bold">Event</span>
            </button>
            <button className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors">
              <span className="text-blue-600 font-bold">Write article</span>
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4 mb-4">
          <p className="text-center text-blue-800">Your feed will appear here</p>
        </div>
      </div>
      
      <div className="hidden md:block col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-blue-100 p-4">
          <h2 className="font-bold mb-2 text-blue-900">LinkedIn News</h2>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="cursor-pointer hover:text-blue-600 hover:underline">Top news story 1</li>
            <li className="cursor-pointer hover:text-blue-600 hover:underline">Top news story 2</li>
            <li className="cursor-pointer hover:text-blue-600 hover:underline">Top news story 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

