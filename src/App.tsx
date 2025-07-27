import { BrowserRouter as Router } from "react-router";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/Routes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./context/queryClient";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          draggable
          theme="colored"
        />
        <Router>
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </>
  );
}

export default App;
