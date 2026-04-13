import { BrowserRouter as Router } from "react-router";
import PWAInstallProvider from "./providers/PWAInstallProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import AppRoutes from "./routes/Routes";
import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <PWAInstallProvider>
        <ThemeProvider>
          <Router>
            <AppRoutes />
          </Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: {
                style: {
                  background: '#2bd98e',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#2bd98e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </ThemeProvider>
      </PWAInstallProvider>
    </AuthProvider>
  );
}

export default App;