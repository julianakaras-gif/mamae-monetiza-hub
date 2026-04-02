import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { profile } = useAuth();
  const name = profile?.full_name?.split(" ")[0] || "Aluna";

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="font-georgia text-2xl font-bold text-foreground mb-2">
        Olá, {name}! 👋
      </h1>
      <p className="text-muted-foreground text-sm">
        Bem-vinda à sua plataforma de transformação digital.
      </p>
    </div>
  );
};

export default Home;
