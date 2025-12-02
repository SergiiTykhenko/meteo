import { createContext, useState } from "react";
import { Snackbar } from "@mui/material";
import uniqueId from "lodash/uniqueId";

interface Snackbar {
  id: string;
  message: string;
  type: "error";
}

export interface SnackbarsContextType {
  addSnackbar: (snackbar: Pick<Snackbar, "message" | "type">) => void;
}

export const SnackbarsContext = createContext<SnackbarsContextType>({
  addSnackbar: () => {},
});

const styles = {
  error: {
    backgroundColor: "red",
    color: "white",
  },
};

const SnackbarsProvider = ({ children }: { children: React.ReactNode }) => {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([]);

  const handleAddSnackbar = (snackbar: Pick<Snackbar, "message" | "type">) => {
    setSnackbars([...snackbars, { ...snackbar, id: uniqueId() }]);
  };

  const handleRemoveSnackbar = (id: string) => {
    setSnackbars(snackbars.filter((snackbar) => snackbar.id !== id));
  };

  return (
    <SnackbarsContext value={{ addSnackbar: handleAddSnackbar }}>
      {children}
      {snackbars.map((snackbar) => (
        <Snackbar
          key={snackbar.id}
          open={true}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          autoHideDuration={5000}
          message={snackbar.message}
          onClose={() => handleRemoveSnackbar(snackbar.id)}
          slotProps={{
            content: {
              sx: styles[snackbar.type],
            },
          }}
        />
      ))}
    </SnackbarsContext>
  );
};

export default SnackbarsProvider;
