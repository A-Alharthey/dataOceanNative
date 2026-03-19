import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import App from "./App";
import { AppProvider } from "./context/AppContext";

export default function AppWrapper() {
  return (
    <AutocompleteDropdownContextProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AutocompleteDropdownContextProvider>
  );
}