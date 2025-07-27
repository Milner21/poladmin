import { BrowserRouter as Router } from "react-router"
import { ToastContainer } from "react-toastify"
import AppRoutes from "./routes/Routes"

function App() {

  return (
    <>
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
          
    </>
  )
}

export default App
