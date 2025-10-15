export const Last20Years = Array.from({ length: 20 }, (_, index) => (new Date().getFullYear() - index).toString());
export const Months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export const deleteAccount = [
  "I am getting better deal somewhere else.",
  "I am not getting the service I was promised.",
  "I am not getting proper support from the team.",
  "I am not getting the features I want.",
  "I want some customization according to my need.",
  "Other",
];

export const BlockRest = ["Quality and Safety Issues", "Chronic Order Delays", "Misrepresentation", "Violation of Platform Policies", "Illegal Activities"];

export const BlockDriver = ["Consistent Order Delays", "Poor Customer Service", "Reckless Driving", "Fraudulent Activity", "Violation of Platform Policies"];

export const CancelOrder = [
  "Payment Issues",
  "Unavailability of Items",
  "Delivery Address Inaccuracy",
  "Security or Fraud Concerns",
  "Violation of Platform Policies",
  "Customer Not Accept",
  "Customer Absent",
];

export const BlockSubAdmin = [
  "Violation of Company Policies",
  "Breach of Security Protocols",
  "Misuse of Administrative Privileges",
  "Failure to Fulfill Assigned Responsibilities",
  "Engagement in Unethical Behavior",
];

export const DeleteBanner = ["Expired Promotion or Event", "Incorrect Information", "Inappropriate Content", "Rebranding or Campaign Change", "Design or Layout Issues"];

export const rolesOptions = [
  { name: "dashboard-management", label: "Dashboard Management" },
  { name: "student-manager", label: "Student Management" },
  { name: "teacher-manager", label: "Teacher Management" },
  { name: "event-manager", label: "Event Type Management" },
  { name: "service-manager", label: "Service Management" },
  { name: "category-management", label: "Category Management" },
  { name: "sub-category-management", label: "Sub Category Management" },
  { name: "quotation-request", label: "Quotation Request Management" },
  { name: "cms-manager", label: "CMS Management" },
  // { name: "delivery-manager", label: "Delivery History Management" },
  // { name: "rating-manager", label: "Rating and Reviews Management" },
  // { name: "report-manager", label: "Reports Management" },
  // { name: "banner-manager", label: "Banner Management" },
  // { name: "finance-manager", label: "Financial Management" },
  // { name: "collector-manager", label: "Collection Management" },
  // { name: "service-location-manager", label: "Service Location  Management" },
  // { name: "delivery-charge-manager", label: "Delivery charge  Management" },
  { name: "Notifications", label: "Notifications Management" },
  { name: "email-template-manager", label: "Email Template Management" },
];

export const colorOptions = [
  { value: "red", name: "Red" },
  { value: "green", name: "Green" },
  { value: "blue", name: "Blue" },
  { value: "yellow", name: "Yellow" },
  { value: "orange", name: "Orange" },
  { value: "purple", name: "Purple" },
  { value: "pink", name: "Pink" },
  { value: "brown", name: "Brown" },
  { value: "black", name: "Black" },
  { value: "white", name: "White" },
  { value: "gray", name: "Gray" },
  { value: "cyan", name: "Cyan" },
  { value: "magenta", name: "Magenta" },
  { value: "lime", name: "Lime" },
  { value: "teal", name: "Teal" },
  { value: "indigo", name: "Indigo" },
  { value: "violet", name: "Violet" },
  { value: "maroon", name: "Maroon" },
  { value: "navy", name: "Navy" },
  { value: "gold", name: "Gold" },
];
