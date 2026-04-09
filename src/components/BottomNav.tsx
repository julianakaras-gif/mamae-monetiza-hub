import { Home, Map, Star, FolderOpen } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SERENA } from "@/data/agents";

const navItems = [
  { title: "Início", path: "/home", icon: Home },
  { title: "Trilha", path: "/trilha", icon: Map },
  { title: "Projetos", path: "/projetos", icon: FolderOpen },
  { title: "Favoritos", path: "/favoritos", icon: Star },
];

const BottomNav = () => {
  const location = useLocation();

  // Hide in chat views
  if (location.pathname.startsWith("/chat/")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around border-t"
      style={{
        backgroundColor: "hsl(186 11% 31%)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 py-2.5 px-4 rounded-xl text-[11px] font-medium transition-colors ${
              isActive ? "bg-[rgba(255,255,255,0.15)]" : ""
            }`}
            style={{ color: isActive ? "hsl(181 56% 41%)" : "rgba(255,255,255,0.7)" }}
          >
            <item.icon size={20} />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
      <NavLink
        to={`/chat/${SERENA.id}`}
        className={`flex flex-col items-center gap-1 py-2.5 px-4 rounded-xl text-[11px] font-medium transition-colors ${
          location.pathname === `/chat/${SERENA.id}` ? "bg-[rgba(255,255,255,0.15)]" : ""
        }`}
        style={{
          color: location.pathname === `/chat/${SERENA.id}` ? "hsl(340 68% 57%)" : "rgba(255,255,255,0.7)",
        }}
      >
        <span className="text-lg leading-none">💛</span>
        <span>Serena</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
