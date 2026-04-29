import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MatchDetails from "./pages/MatchDetails";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-text selection:bg-primary/30">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/match/:id" element={<MatchDetails />} />
        </Routes>
      </div>
    </Router>
  );
}
