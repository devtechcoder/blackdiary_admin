import moment from "moment";
import { Timezone } from "./timezone";
export const getFileExtension = (url) => {
  // Get the last part of the URL after the last '/'
  const filename = url.substring(url.lastIndexOf('/') + 1);

  // Get the file extension by getting the last part of the filename after the last '.'
  const extension = filename.substring(filename.lastIndexOf('.') + 1);

  return extension;
};

export const isObjectEmpty = (obj) => {
  for (const key in obj) {
    if (obj[key]) {

      if (obj[key] === '{"min":0,"max":20000000}') {

      } else {
        return false;
      }

    }
  }
  return true;
}

export function formatDate(date) {
  const now = moment();
  const inputDate = moment(date);

  if (now.isSame(inputDate, 'day')) {
    return 'Today, ' + inputDate.format('hh:mm A');
  } else if (now.subtract(1, 'day').isSame(inputDate, 'day')) {
    return 'Yesterday, ' + inputDate.format('hh:mm A');
  } else {
    return inputDate.format('DD/MM/YYYY, hh:mm A');
  }
}

export function formatPhone(countryCode, phoneNumber) {

  const numericPhoneNumber = phoneNumber.replace(/\D/g, '');
  if (countryCode && numericPhoneNumber) {
    const groups = numericPhoneNumber.match(/(\d{2})(\d{3})(\d{3})(\d+)/);
    if (groups) {
      return `+${countryCode}-${groups[1]}-${groups[2]}-${groups[3]}-${groups[4]}`;
    }
  }
  return phoneNumber;
}


export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const removeNullValues = (obj) => {
  for (const key in obj) {
    if (obj[key] === null) {
      delete obj[key];
    } 
  }
  return obj
}

export const dateString = (created_at,format="LLL")=>{
  console.log("Client TimeZone",Timezone);
  if(!created_at) return 
  return moment(created_at).tz(Timezone).format(format)
} 

export const getRandomColor = (index) => {

  const color = ["#a9de03", "#52e2f8", "#cb04b6", "#da2deb", "#06d6bd", "#bb3913", "#2026c8", "#9d8252", "#8b121a", "#0d7047", "#04acc2", "#852472", "#ea2c43", "#53d965", "#de5867", "#ac1c11", "#0a4c9e", "#170232", "#f04b3f", "#5f0044"]
  // Generate random values for red, green, and blue components
  return color[index]
  
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);

  // Convert decimal values to hexadecimal
  var hexR = r.toString(16).padStart(2, '0');
  var hexG = g.toString(16).padStart(2, '0');
  var hexB = b.toString(16).padStart(2, '0');

  // Concatenate and return the hex color code
  return '#' + hexR + hexG + hexB;
}