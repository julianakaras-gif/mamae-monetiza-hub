import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProjectProvider } from "@/hooks/useProject";
import { AgentProgressProvider } from "@/contexts/AgentProgressContext";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import AcessoBloqueado from "@/pages/AcessoBloqueado";
import Home from "@/pages/Home";
import Trilha from "@/pages/Trilha";
import Favoritos from "@/pages/Favoritos";
import Projetos from "@/pages/Projetos";
import ProjetoDetalhe from "@/pages/ProjetoDetalhe";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-ciano border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (profile && profile.subscription_status !== "active") {
    return <Navigate to="/acesso-bloqueado" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (profile && profile.subscription_status !== "active") {
      return <Navigate to="/acesso-bloqueado" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ProjectProvider>
          <AgentProgressProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route path="/acesso-bloqueado" element={<AcessoBloqueado />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/trilha" element={<Trilha />} />
              <Route path="/favoritos" element={<Favoritos />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/projetos/:projectId" element={<ProjetoDetalhe />} />
              <Route path="/chat/:agentId" element={<Chat />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          </AgentProgressProvider>
          </ProjectProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
