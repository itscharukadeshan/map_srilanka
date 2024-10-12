/** @format */

import SearchComponent from "../search/SearchComponent";
import { clearSearchResults } from "../../services/storageService";
import { FileMinus } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  return (
    <div
      className={`fixed top-16 left-0 h-svh w-64 bg-gray-900 shadow-lg transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:w-0`}>
      <div className='p-4'>
        <button
          onClick={toggleSidebar}
          className='md:hidden p-2 bg-gray-900 btn-outline rounded'></button>
        <SearchComponent />
        <ul className='w-max flex flex-col gap-4 absolute md:bottom-36 '>
          <button
            onClick={clearSearchResults}
            className='btn btn-ghost btn-outline btn-warning'>
            <FileMinus /> Clear Map Overlay
          </button>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
