import { Home, Map, Star, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";
import { useAgentProgress } from "@/hooks/useAgentProgress";

const menuItems = [
  { title: "Início", path: "/home", icon: Home },
  { title: "Trilha", path: "/trilha", icon: Map },
  { title: "Favoritos", path: "/favoritos", icon: Star },
];

const quickAgents = [
  { name: "Maia", initial: "M", color: "bg-ciano" },
  { name: "Liora", initial: "L", color: "bg-rosa" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { progressPercent } = useAgentProgress();

  const userInitial = profile?.name?.charAt(0)?.toUpperCase() || "A";
  const userName = profile?.name || "Aluna";

  return (
    <aside className="w-[218px] min-h-screen flex flex-col bg-sidebar text-sidebar-foreground shrink-0">
      {/* Logo */}
      <div className="pt-6 pb-6 flex justify-center">
        <Logo size={52} light />
      </div>

      {/* Menu section */}
      <div className="px-4 mb-2">
        <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3 pl-2 font-raleway">
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
                  <span className="absolute right-3 w-2 h-2 rounded-full bg-ciano" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-[rgba(255,255,255,0.1)]" />

      {/* Quick agents */}
      <div className="px-4 mb-4">
        <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3 pl-2 font-raleway">
          Sempre disponíveis
        </p>
        <div className="space-y-2">
          {quickAgents.map((agent) => (
            <NavLink
              key={agent.name}
              to={`/chat/${agent.name.toLowerCase()}`}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-[rgba(255,255,255,0.07)] transition-colors"
            >
              <div
                className={`w-7 h-7 rounded-full ${agent.color} flex items-center justify-center text-xs font-bold text-primary-foreground`}
              >
                {agent.initial}
              </div>
              <span>{agent.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Progress */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-widest opacity-40 font-raleway">
            Progresso geral
          </p>
          <span className="text-xs font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-[rgba(255,255,255,0.1)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #29a6ab, #df437d)",
            }}
          />
        </div>
      </div>

      {/* User card */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.07)]">
          <div className="w-9 h-9 rounded-full bg-rosa flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-[11px] opacity-50">Aluna ativa</p>
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
