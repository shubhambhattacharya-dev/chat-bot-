import { Route , Routes} from "react-router-dom"
import HomePage from "./pages/Home/HomePage.jsx"
import LoginPage from "./pages/auth/login/LogInPage.jsx"
import SignPage from "./pages/auth/signup/signupPage.jsx"
import NotificationPage from "./pages/notification/NotificationPage.jsx"
import ProfilePage from "./pages/profile/ProfilePage.jsx"
import Sidebar from "./components/common/Sidebar.jsx"
import RightPanel from "./components/common/RightPanal.jsx"

function App() {
 

  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar/>
      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/signup" element={<SignPage/>}/>
        <Route path="/login" element={<LoginPage />}/>
        <Route path="/notifications" element={<NotificationPage/>}/>
        <Route path="/profile/:username" element={<ProfilePage/>}/>

      </Routes>
      <RightPanel/>
   
    </div>
  )
}

export default App

