import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginSignUp from "./views/loginSignUp";
import StudentDashboard from "./views/studentDashboard";
import AdminDashboard from "./views/adminDashboard";
import PublicGallery from "./views/publicGallery";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignUp />} />
        <Route path="/login" element={<LoginSignUp />} />
        <Route path="/gallery" element={<PublicGallery />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
