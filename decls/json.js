declare type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
declare type JSONObject = { [key:string]: JSONValue };
declare type JSONArray = Array<JSONValue>;
