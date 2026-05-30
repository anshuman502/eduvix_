export const API_BASE = "http://eduvix.infinityfree.me/api/api.php";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("ff_token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token ?? ""}`,
  };
};
