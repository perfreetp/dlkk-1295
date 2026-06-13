import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Rules from "./pages/Rules";
import Anomalies from "./pages/Anomalies";
import AnomalyDetail from "./pages/AnomalyDetail";
import Records from "./pages/Records";
import Reports from "./pages/Reports";
import InspectionHistoryDetail from "./pages/InspectionHistoryDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="rules" element={<Rules />} />
          <Route path="anomalies" element={<Anomalies />} />
          <Route path="anomalies/:id" element={<AnomalyDetail />} />
          <Route path="records" element={<Records />} />
          <Route path="reports" element={<Reports />} />
          <Route path="inspections/:id" element={<InspectionHistoryDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}
