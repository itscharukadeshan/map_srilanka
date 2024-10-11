/** @format */

import { useLocalStorage } from "@uidotdev/usehooks";

interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
}

export const useAdministrativeData = () => {
  const [administrativeData, setAdministrativeData] = useLocalStorage<
    Administrative[]
  >("administrativeData", []);

  const fetchAdministrativeData = async () => {
    if (administrativeData.length === 0) {
      try {
        const response = await fetch(
          "https://corsproxy.io/?https://raw.githubusercontent.com/itscharukadeshan/map_srilanka/refs/heads/main/src/data/search/administrative.json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setAdministrativeData(data);
      } catch (error) {
        console.error("Failed to fetch administrative data:", error);
      }
    }
  };

  return { administrativeData, fetchAdministrativeData };
};
