// Path: admin/src/components/navbar/Navbar.jsx
import "./Navbar.css";
import navlogo from "../../assets/admin_assets/nav-logo.svg";
import navProfile from "../../assets/admin_assets/nav-profile.svg";

const NavBar = () => {
  return (
    <div className="navbar">
      <img src={navlogo} alt="nav-logo" className="nav-logo" />
      <img src={navProfile} alt="nav-profile" className="nav-profile" />
    </div>
  );
};

export default NavBar;
