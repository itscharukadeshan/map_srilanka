/** @format */

interface NavBarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

function NavBar({ toggleSidebar, isSidebarOpen }: NavBarProps) {
  return (
    <div className='navbar bg-base-100'>
      <div className='flex-none'>
        <label className='btn btn-circle swap swap-rotate'>
          <input
            onClick={toggleSidebar}
            type='checkbox'
            checked={isSidebarOpen}
          />

          <svg
            className={`swap-off fill-current ${isSidebarOpen ? "hidden" : ""}`}
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            viewBox='0 0 512 512'>
            <path d='M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z' />
          </svg>

          <svg
            className={`swap-on fill-current ${isSidebarOpen ? "" : "hidden"}`}
            xmlns='http://www.w3.org/2000/svg'
            width='32'
            height='32'
            viewBox='0 0 512 512'>
            <polygon points='400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49' />
          </svg>
        </label>
      </div>
      <div className='flex-1'>
        <a className='btn btn-ghost text-xl'>Map Srilanka</a>
      </div>
      <div className='flex-none'>
        <button className='btn btn-square btn-ghost'></button>
      </div>
    </div>
  );
}

export default NavBar;
