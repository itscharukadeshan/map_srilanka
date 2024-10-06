/** @format */
import NavBar from "./component/layout/NavBar";

import Map from "./component/map/Map";

export default function App() {
  return (
    <div className='h-screen flex flex-col'>
      <NavBar />

      <div className='flex flex-1'>
        <main className='flex-1 bg-gray-100 relative '>
          <Map />
        </main>
      </div>
    </div>
  );
}
