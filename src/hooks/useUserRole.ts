import { useAppState, useAppDispatch } from "@/context/AppContext";
import { UserRole } from "@/types";

export function useUserRole() {
  const { userRole } = useAppState();
  const dispatch = useAppDispatch();

  const setUserRole = (role: UserRole) => {
    dispatch({ type: "SET_USER_ROLE", payload: role });
  };

  return { userRole, setUserRole };
}
