import { Outlet } from 'react-router-dom';
import Header from "../components/shared/Header";
import Sidebar from "../components/shared/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;