import { Route , Routes} from "react-router-dom"
import HomePage from "./pages/Home/HomePage.jsx"
import LoginPage from "./pages/auth/login/LogInPage.jsx"
import SignPage from "./pages/auth/signup/signupPage.jsx"

function App() {
 

  return (
    <div className="flex max-w-6xl mx-auto">
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/signup" element={<SignPage/>}/>
        <Route path="/login" element={<LoginPage />}/>

      </Routes>
   
    </div>
  )
}

export default App

