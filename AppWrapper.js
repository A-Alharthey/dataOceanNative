import App from "./App";
import { AppProvider } from "./context/AppContext";

export default function AppWrapper() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}