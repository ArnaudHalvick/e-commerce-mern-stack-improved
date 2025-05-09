// Path: admin/src/pages/admin/Admin.jsx
import "./Admin.css";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../components/addProduct/AddProduct";
import ListProduct from "../../components/listProduct/ListProduct";

const Dashboard = () => {
  const stats = [
    { title: "Total Products", value: "126", change: "+12%", positive: true },
    { title: "Total Orders", value: "845", change: "+23%", positive: true },
    { title: "Revenue", value: "$28,459", change: "+18%", positive: true },
    { title: "Returns", value: "15", change: "-5%", positive: true },
  ];

  return (
    <div className="admin-dashboard">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="admin-stat-card">
            <div className="admin-stat-title">{stat.title}</div>
            <div className="admin-stat-value">{stat.value}</div>
            <div
              className={`admin-stat-change ${
                stat.positive ? "positive" : "negative"
              }`}
            >
              {stat.change} from last month
            </div>
          </div>
        ))}
      </div>

      <div className="admin-row">
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Orders</h2>
          </div>
          <div className="admin-card-body">
            <div className="admin-table-responsive">
              <table className="admin-table">
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
