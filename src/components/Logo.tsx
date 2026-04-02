interface LogoProps {
  size?: number;
  light?: boolean;
}

const Logo = ({ size = 64, light = false }: LogoProps) => {
  const scale = size / 64;
  const textColor = light ? "#ffffff" : "#4a5759";
  const subtitleColor = light ? "rgba(255,255,255,0.7)" : "#6b8082";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={64 * scale}
        height={40 * scale}
        viewBox="0 0 80 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* First M - amarelo */}
        <path
          d="M2 36V10L12 26L22 10V36"
          stroke="#ebc780"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Heart in the middle - rosa */}
        <path
          d="M33 20C33 16 36 13 39 13C42 13 44 16 44 16C44 16 46 13 49 13C52 13 55 16 55 20C55 26 44 33 44 33C44 33 33 26 33 20Z"
          fill="#df437d"
        />
        {/* Second M - ciano */}
        <path
          d="M58 36V10L68 26L78 10V36"
          stroke="#29a6ab"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        className="font-georgia font-bold"
        style={{ fontSize: 13 * scale, color: textColor, lineHeight: 1.2 }}
      >
        Método
      </span>
      <span
        className="font-raleway uppercase tracking-[2px]"
        style={{ fontSize: 10 * scale, color: subtitleColor, lineHeight: 1.2 }}
      >
        Mamãe Monetiza
      </span>
    </div>
  );
};

export default Logo;
