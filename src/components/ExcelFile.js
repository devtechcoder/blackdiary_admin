import * as XLSX from "xlsx";
import moment from "moment";

const DownloadExcel = (data, filename) => {
  const mainHeading =
    filename + " Excel Data, Export on " + moment().format("DD-MM-YYYY");
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  // XLSX.utils.sheet_add_aoa(worksheet, [[mainHeading]], { origin: 'A1' });
  XLSX.utils.book_append_sheet(workbook, worksheet, filename);
  XLSX.writeFile(
    workbook,
    `${
      moment().milliseconds() +
      1000 * (moment().seconds() + 60 * 60) +
      `-${filename}`
    }.xlsx`,
  );
  return true;
};

const SampleFileDownload = (xlurl) => {
  // let fileUrl = process.env.PUBLIC_URL;
  // console.log(fileUrl, "fileUrl");
  // if (sectionName === "Provider") {
  //   fileUrl += xlurl;
  // } else if (sectionName === "Brand") {
  //   fileUrl += "/brand_sample.xlsx";
  // } else if (sectionName === "Product") {
  //   fileUrl += "/product_sample.xlsx";
  // }

  // fileUrl += "/Deliver_charge.xlsx";
  console.log("xlurl", xlurl);
  const link = document.createElement("a");
  link.href = xlurl;
  link.download = "sample.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export { DownloadExcel, SampleFileDownload };
