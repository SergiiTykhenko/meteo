import CssBaseline from "@mui/material/CssBaseline";
import Map from "./pages/Map/Map";
import SnackbarsProvider from "./components/SnackbarsProvider/SnackbarsProvider";

const App = () => (
  <SnackbarsProvider>
    <CssBaseline />
    <Map />
  </SnackbarsProvider>
);

export default App;
