import { BrowserRouter as Router } from "react-router";
import AppRoutes from "./routes/Routes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./context/queryClient";
import { AuthProvider } from "./providers/AuthProvider";
import ThemeProvider from "./providers/ThemeProvider";
import PWAInstallProvider from "./providers/PWAInstallProvider";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <PWAInstallProvider>
          <ThemeProvider>
            <AuthProvider>
              <Router>
                <AppRoutes />
              </Router>
            </AuthProvider>
          </ThemeProvider>
        </PWAInstallProvider>
      </QueryClientProvider>
      
    </>
  );
}

export default App;
