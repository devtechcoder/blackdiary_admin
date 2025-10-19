let appMode = process.env.REACT_APP_ENV;
let ASSET_URL = "http://localhost:7900//image/";
let URL;

console.log("appMode", appMode);

// 3.20.147.34

if (appMode === "development") {
  // URL = "https://backend.insave.com/api/";
  URL = "https://blackdiary.onrender.com/api/";
} else {
  URL = "https://blackdiary.onrender.com/api/";
}

let apiPath = {
  baseURL: URL,
  assetURL: ASSET_URL,
  dashboard: "admin/dashboard",
  login: "admin/auth/login",

  profile: "admin/auth/get-profile",
  updateProfile: "admin/auth/update-profile",
  changePassword: "admin/auth/change-password",

  forgotPassword: "admin/auth/forgot-password",
  verifyOTP: "admin/auth/verify-otp",
  resetPassword: "admin/auth/reset-password",

  // Customer APIs
  listCustomer: "admin/customer",

  //bannner API
  banner: "admin/banner",
  statusBanner: "admin/banner/status",

  // Content APIs
  content: "admin/content",

  // EmailTemplate APIs
  listEmailTemplate: "admin/email-template/list",
  addEditEmailTemplate: "admin/email-template/add-edit",
  statusEmailTemplate: "admin/email-template/status",
  viewEmailTemplate: "admin/email-template/view",

  //category
  listCategory: "admin/category",
  statusCategory: "admin/category/status",

  //Occasion
  listOccasion: "admin/occasion",
  statusOccasion: "admin/occasion/status",

  //Diary
  listDiary: "admin/diary",
  statusDiary: "admin/diary/status",

  // sub category
  listSubCategory: "admin/sub-category",
  statusSubCategory: "admin/sub-category/status",

  common: {
    categories: "common/categories",
    subCategories: "common/sub-categories",
    getUsers: "common/customer",
    getOccasion: "common/occasion",
    imageUpload: "common/image-upload",
  },
};

export default apiPath;
