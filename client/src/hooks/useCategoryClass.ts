export const useCategoryClass = (category: string): string => {
  const cat = category?.toLowerCase() || "";

  if (cat.includes("restaurant") || cat.includes("cafe"))
    return "bg-orange-100 text-orange-800 border border-orange-200";
  if (cat.includes("museum") || cat.includes("historic") || cat.includes("temple"))
    return "bg-blue-100 text-blue-800 border border-blue-200";
  if (cat.includes("park") || cat.includes("scenic"))
    return "bg-green-100 text-green-800 border border-green-200";
  if (cat.includes("hotel"))
    return "bg-indigo-100 text-indigo-800 border border-indigo-200";
  if (cat.includes("shopping") || cat.includes("market"))
    return "bg-pink-100 text-pink-800 border border-pink-200";
  if (cat.includes("transport") || cat.includes("station"))
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";

  return "bg-gray-100 text-gray-800 border border-gray-200";
};