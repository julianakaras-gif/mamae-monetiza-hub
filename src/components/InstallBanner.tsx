import { useEffect, useState } from "react";

export function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show in iframes or preview hosts
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    const isPreviewHost =
      window.location.hostname.includes("id-preview--") ||
      window.location.hostname.includes("lovableproject.com");

    if (isInIframe || isPreviewHost) return;

    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);
      const dismissed = localStorage.getItem("pwa_banner_dismissed");
      if (!dismissed) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function instalar() {
    prompt?.prompt();
    setVisible(false);
    localStorage.setItem("pwa_banner_dismissed", "true");
  }

  function dispensar() {
    setVisible(false);
    localStorage.setItem("pwa_banner_dismissed", "true");
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg"
      style={{ backgroundColor: "#1C3C2C", color: "#F5F1E9", maxWidth: "420px", width: "90%" }}
    >
      <span style={{ fontSize: "24px" }}>📲</span>
      <div className="flex-1">
        <p style={{ fontWeight: 600, fontSize: "14px" }}>Instalar o Prospera</p>
        <p style={{ fontSize: "12px", opacity: 0.8 }}>Acesse como app, sem abrir o navegador</p>
      </div>
      <button
        onClick={instalar}
        style={{ backgroundColor: "#C6A86C", color: "#1C3C2C", borderRadius: "8px", padding: "6px 14px", fontWeight: 700, fontSize: "13px" }}
      >
        Instalar
      </button>
      <button onClick={dispensar} style={{ opacity: 0.6, fontSize: "18px", lineHeight: 1 }}>×</button>
    </div>
  );
}
