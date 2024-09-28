/** @format */

export type DSName = {
  gnd_name: string;
  type: string;
  filename: string;
};

export type District = {
  [gndName: string]: DSName[];
};

export type Province = {
  [districtName: string]: District;
};

export type AdministrativeData = {
  [provinceName: string]: Province;
};
