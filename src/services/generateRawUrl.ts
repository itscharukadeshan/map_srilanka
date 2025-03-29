/** @format */

interface Administrative {
  filename: string;
  gnd_name?: string;
  type: string;
  ds_division_name?: string;
  province_name?: string;
  district_name?: string;
  search_query: string;
}

const BASE_URL =
  "https://github.com/itscharukadeshan/map_srilanka_data/blob/main/v1/administrative";

const generateRawUrl = (item: Administrative): string | null => {
  let url = "";

  switch (item.type) {
    case "gn_divisions":
      if (
        item.province_name &&
        item.district_name &&
        item.ds_division_name &&
        item.gnd_name
      ) {
        url = `${BASE_URL}/gn_division/${item.province_name}/${item.district_name}/${item.ds_division_name}/${item.filename}`;
      }
      break;

    case "ds_divisions":
      if (item.province_name && item.district_name && item.ds_division_name) {
        url = `${BASE_URL}/ds_division/${item.province_name}/${item.district_name}/${item.filename}`;
      }
      break;

    case "district":
      if (item.province_name && item.district_name) {
        url = `${BASE_URL}/district/${item.province_name}/${item.filename}`;
      }
      break;

    case "province":
      if (item.province_name) {
        url = `${BASE_URL}/province/${item.filename}`;
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

  const convertToRawUrl = (githubUrl: string): string => {
    const rawUrl = githubUrl
      .replace("https://github.com/", "https://raw.githubusercontent.com/")
      .replace("/blob/", "/refs/heads/");

    return `${rawUrl}`;
  };

  const updatedUrl = convertToRawUrl(url);

  console.log(updatedUrl);

  return {
    name: finalName,
    type: item.type,
    url: updatedUrl,
  };
};

export default createResultObject;
