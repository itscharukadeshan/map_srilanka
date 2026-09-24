/** @format */
import { DATA_PRIMARY } from "./dataHosts";

interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
}

const BASE_URL = `${DATA_PRIMARY}`;

const generateRawUrl = (item: Administrative): string | null => {
  let url = "";
  // data repo stores underscores; index filenames may contain spaces
  const safeFilename = item.filename.replace(/ /g, "_");

  switch (item.type) {
    case "gn_divisions":
      if (
        item.province_name &&
        item.district_name &&
        item.ds_division_name &&
        item.gnd_name
      ) {
        url = `${BASE_URL}/gn_division/${item.province_name}/${item.district_name}/${item.ds_division_name}/${safeFilename}`;
      }
      break;

    case "ds_divisions":
      if (item.province_name && item.district_name && item.ds_division_name) {
        url = `${BASE_URL}/ds_division/${item.province_name}/${item.district_name}/${safeFilename}`;
      }
      break;

    case "district":
      if (item.province_name && item.district_name) {
        url = `${BASE_URL}/district/${item.province_name}/${safeFilename}`;
      }
      break;

    case "province":
      if (item.province_name) {
        url = `${BASE_URL}/province/${safeFilename}`;
      }
      break;

    default:
      return null;
  }

  return url;
};

const createResultObject = (item: Administrative) => {
  const url = generateRawUrl(item);
  if (!url) {
    return null;
  }

  const nameParts = item.filename.split("_");
  const cleanName = nameParts.slice(1, -1).join("_");
  const finalName = `${cleanName} ${item.type
    .replace(/_divisions$/, "_division")
    .replace("_", " ")}`;

  return {
    name: finalName,
    type: item.type,
    url,
  };
};

export default createResultObject;
