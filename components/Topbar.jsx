import { FiMenu, FiSearch } from "react-icons/fi";

export default function Topbar({ onToggleSidebar }) {
  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-gray-100"
        >
          <FiMenu size={18}/>
        </button>
        <h1 className="text-lg font-semibold">Documentero</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            className="border rounded px-3 py-1 w-72"
            placeholder="Search templates..."
          />
          <FiSearch className="absolute right-2 top-2 text-gray-400" />
        </div>

        <button className="bg-accent text-white px-3 py-1 rounded">
          New Document
        </button>
      </div>
    </header>
  );
}
