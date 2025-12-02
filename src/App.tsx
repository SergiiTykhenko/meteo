import CssBaseline from "@mui/material/CssBaseline";
import { Suspense } from "react";
import Home from "./pages/Home/Home";

const App = () => (
  <>
    <CssBaseline />
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  </>
);

export default App;
