import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import SerenaFAB from "./SerenaFAB";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <SerenaFAB />
    </div>
  );
};

export default AppLayout;
