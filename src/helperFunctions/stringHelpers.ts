export const capitalise = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) {
    return "";
  }
  if (dateString === "UNREQUESTED") {
    return "Unrequested";
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("en-GB", options);
};
