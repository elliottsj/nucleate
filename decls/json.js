declare type JSON = string | number | boolean | null | JSONObject | JSONArray;
declare type JSONObject = { [key:string]: JSON };
declare type JSONArray = Array<JSON>;
