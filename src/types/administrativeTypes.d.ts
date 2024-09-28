/** @format */

export type DSDivision = {
  district_name: string;
  ds_division_name: string;
  type: string;
  filename: string;
};

export type District = {
  district_name: string;
  province_name: string;
  type: string;
  filename: string;
  ds_divisions: {
    [dsDivisionName: string]: DSDivision;
  };
};

export type Province = {
  province_name: string;
  type: string;
  filename: string;
  districts: {
    [districtName: string]: District;
  };
};

export type AdministrativeData = {
  [provinceName: string]: Province;
};
