import { Home, Map, Star, FolderOpen, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useAgentProgress } from "@/hooks/useAgentProgress";

const menuItems = [
  { title: "Início", path: "/home", icon: Home },
  { title: "Trilha", path: "/trilha", icon: Map },
  { title: "Projetos", path: "/projetos", icon: FolderOpen },
  { title: "Favoritos", path: "/favoritos", icon: Star },
];

const AppSidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { progressPercent } = useAgentProgress();

  const userInitial = profile?.name?.charAt(0)?.toUpperCase() || "A";
  const userName = profile?.name || "Aluna";

  return (
    <aside className="w-[218px] min-h-screen flex flex-col shrink-0" style={{ backgroundColor: "#1C3C2C", color: "#fff" }}>
      {/* Logo */}
      <div className="pt-6 pb-6 flex justify-center">
        <Logo size={42} light />
      </div>

      {/* Menu section */}
      <div className="px-4 mb-2">
        <p className="text-xs uppercase tracking-widest opacity-40 mb-3 pl-2">
          Menu
        </p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                  isActive
                    ? "bg-[rgba(255,255,255,0.13)]"
                    : "hover:bg-[rgba(255,255,255,0.07)]"
                }`}
              >
                <item.icon size={18} />
                <span>{item.title}</span>
                {isActive && (
                  <span className="absolute right-3 w-2 h-2 rounded-full bg-gold" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-[rgba(255,255,255,0.1)]" />


      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest opacity-40">
            Progresso geral
          </p>
          <span className="text-xs font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #6E9876, #C6A86C)",
            }}
          />
        </div>
      </div>

      {/* User card */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.07)]">
          <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-sm font-bold text-sage-dark shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs opacity-50">Aluna ativa</p>
          </div>
          <button
            onClick={signOut}
            className="opacity-40 hover:opacity-100 transition-opacity"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;