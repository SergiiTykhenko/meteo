import CssBaseline from "@mui/material/CssBaseline";
import Map from "./pages/Map/Map";
import SnackbarsProvider from "./components/SnackbarsProvider/SnackbarsProvider";
import type { MeteoData } from "./pages/Map/hooks/useMeteoData";

export interface InitialData {
  meteoData: MeteoData;
}

interface Props {
  initialData: InitialData;
}

const App = ({ initialData }: Props) => (
  <SnackbarsProvider>
    <CssBaseline />
    <Map initialMeteoData={initialData.meteoData} />
  </SnackbarsProvider>
);

export default App;
