export const formatDate = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
  }).format(new Date(value));
};

export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatEnumLabel = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const formatShortId = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
};
