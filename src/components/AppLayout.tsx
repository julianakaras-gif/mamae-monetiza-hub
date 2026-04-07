import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import SerenaFAB from "./SerenaFAB";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <Outlet />
      </main>
      <div className="hidden md:block">
        <SerenaFAB />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppLayout;
