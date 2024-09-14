import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// shadcn stuff
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatParams = (params: any) => {
  return Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");
};

const convertToJSON = async (res: any) => {
  let errormessage = "";
  try {
    const obj = await res.clone().json();
    if (!res.ok) {
      // first, determine if the parsed object is a string or if an error message is embedded inside.
      console.log("Error object:", obj);
      errormessage = obj?.error !== undefined ? obj.error : obj;
      errormessage = `API request failed with response status ${res.status}: ${errormessage}`;
    } else {
      return obj;
    }
  } catch (e) {
    const text = await res.text();
    throw `API request's result could not be converted to a JSON object: \n${text}`;
  }
  throw errormessage;
};

// Helper code to make a get request. Default parameter of empty JSON Object for params.
// Returns a Promise to a JSON Object.
export const get = async (endpoint: string, params: object = {}) => {
  const fullPath = endpoint + "?" + formatParams(params);
  try {
    const response = await fetch(fullPath);
    const json = await convertToJSON(response);
    return json;
  } catch (error) {
    throw `${error}`;
  }
};

// Helper code to make a post request. Default parameter of empty JSON Object for params.
// Returns a Promise to a JSON Object.
export const post = async (endpoint: string, params: object = {}) => {
  try {
    const response = await fetch(endpoint, {
      method: "post",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await convertToJSON(response);
    return json;
  } catch (error) {
    throw `${error}`;
  }
};

export const isApple = () => (/(Mac|iPhone|iPod|iPad)/i).test(window.navigator.userAgent.toLowerCase());
