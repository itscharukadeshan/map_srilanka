/** @format */

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  return (
    <div
      className={`fixed top-16 left-0 h-full w-64 bg-gray-900 shadow-lg transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:w-64`}>
      <div className='p-4'>
        <button
          onClick={toggleSidebar}
          className='md:hidden p-2 bg-gray-900 btn-outline rounded'></button>
        <ul></ul>
      </div>
    </div>
  );
};

export default Sidebar;
