import { useParams } from "react-router-dom";

const Chat = () => {
  const { agentId } = useParams();

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="font-georgia text-2xl font-bold text-foreground mb-2 capitalize">
        Chat com {agentId}
      </h1>
      <p className="text-muted-foreground text-sm">O chat com o agente será implementado em breve.</p>
    </div>
  );
};

export default Chat;
