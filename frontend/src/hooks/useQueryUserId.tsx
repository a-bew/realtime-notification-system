import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

export function useQueryUserId() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  return searchParams.get("userId") || "";
}
