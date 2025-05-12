// Path: admin/src/pages/admin/Admin.jsx
import "./Admin.css";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../pages/addProduct/";
import ListProduct from "../listProduct";

const Dashboard = () => {
  const stats = [
    { title: "Total Products", value: "126", change: "+12%", positive: true },
    { title: "Total Orders", value: "845", change: "+23%", positive: true },
    { title: "Revenue", value: "$28,459", change: "+18%", positive: true },
    { title: "Returns", value: "15", change: "-5%", positive: true },
  ];

  return (
    <div className="admin-page-dashboard">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="admin-page-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="admin-page-stat-card">
            <div className="admin-page-stat-title">{stat.title}</div>
            <div className="admin-page-stat-value">{stat.value}</div>
            <div
              className={`admin-page-stat-change ${
                stat.positive ? "positive" : "negative"
              }`}
            >
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="admin-page-row">
        <div className="admin-page-card">
          <div className="admin-page-card-header">
            <h2>Recent Orders</h2>
          </div>
          <div className="admin-page-card-body">
            <div className="admin-page-table-responsive">
              <table className="admin-page-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#ORD-0012</td>
                    <td>John Smith</td>
                    <td>May 15, 2023</td>
                    <td>Delivered</td>
                    <td>$125.00</td>
                  </tr>
                  <tr>
                    <td>#ORD-0011</td>
                    <td>Sarah Johnson</td>
                    <td>May 14, 2023</td>
                    <td>Processing</td>
                    <td>$89.50</td>
                  </tr>
                  <tr>
                    <td>#ORD-0010</td>
                    <td>Michael Brown</td>
                    <td>May 13, 2023</td>
                    <td>Shipped</td>
                    <td>$245.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/list-product" element={<ListProduct />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default Admin;
