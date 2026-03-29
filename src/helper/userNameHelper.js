export const USER_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$/;

export const normalizeUserName = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9._]/g, "");
};

export const isValidUserName = (value) => {
  const normalized = normalizeUserName(value);
  return USER_NAME_PATTERN.test(normalized);
};
