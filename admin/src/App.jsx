// Path: admin/src/App.jsx
import NavBar from "./components/navbar/Navbar";
import Admin from "./pages/admin/Admin";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <NavBar />
      <Admin />
    </div>
  );
}

export default App;
