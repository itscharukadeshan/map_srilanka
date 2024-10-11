/** @format */

import { useEffect, useState } from "react";
import NavBar from "./component/layout/NavBar";
import Sidebar from "./component/layout/SideBar";
import Map from "./component/map/Map";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSidebarOpen(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='h-screen flex flex-col'>
      <NavBar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className='flex flex-1'>
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <main
          className={`flex-1 bg-gray-900 relative  transition-all duration-300 ${
            isSidebarOpen ? "ml-64" : "ml-0"
          }`}>
          <Map />
        </main>
      </div>
    </div>
  );
};

export default App;
