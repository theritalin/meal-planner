/** İsimden baş harfleri üretir: "Ayşe Yılmaz" -> "AY". */
export const getInitials = (name) => {
  if (!name) return "K";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
};

export const CONTACT_EMAIL =
  process.env.REACT_APP_CONTACT_EMAIL || "bsckbilgi@gmail.com";
