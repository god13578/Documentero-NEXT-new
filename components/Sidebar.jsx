import { FiFileText, FiEye } from "react-icons/fi";

export default function Sidebar({ open }) {
  return (
    <aside
      className={`bg-white border-r h-full transition-all ${
        open ? "w-64" : "w-16"
      }`}
    >
      <div className="p-4 font-bold text-xl">D</div>

      <ul className="px-2 space-y-1">
        <li>
          <div className="flex items-center gap-3 p-2 rounded text-gray-800">
            <FiFileText />
            {open && <span>Builder</span>}
          </div>
        </li>

        <li>
          <div className="flex items-center gap-3 p-2 rounded text-gray-400">
            <FiEye />
            {open && <span>Preview</span>}
          </div>
        </li>
      </ul>
    </aside>
  );
}
