import { useContext } from "react";
import { SnackbarsContext } from "@/components/SnackbarsProvider/SnackbarsProvider";

export const useSnackbars = () => {
  return useContext(SnackbarsContext).addSnackbar;
};

export default useSnackbars;
