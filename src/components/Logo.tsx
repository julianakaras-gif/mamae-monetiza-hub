interface LogoProps {
  size?: number;
  light?: boolean;
}

const Logo = ({ size = 40, light = false }: LogoProps) => {
  const scale = size / 40;
  const textColor = light ? "#FFFFFF" : "#1C3C2C";
  const subtextColor = light ? "rgba(255,255,255,0.6)" : "#6E9876";
  const petalColor = light ? "rgba(255,255,255,0.9)" : "#1C3C2C";
  const petalMid = light ? "rgba(255,255,255,0.6)" : "#3A5C46";
  const petalLight = light ? "rgba(255,255,255,0.4)" : "#6E9876";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={40 * scale}
        height={40 * scale}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer petals - 8 rotated ellipses */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={`outer-${i}`}
            cx="20"
            cy="20"
            rx="3"
            ry="12"
            fill={i % 2 === 0 ? petalColor : petalMid}
            opacity={0.7}
            transform={`rotate(${angle} 20 20)`}
          />
        ))}
        {/* Medium petals - 6 smaller ellipses */}
        {[30, 90, 150, 210, 270, 330].map((angle, i) => (
          <ellipse
            key={`mid-${i}`}
            cx="20"
            cy="20"
            rx="2"
            ry="8"
            fill={petalLight}
            opacity={0.5}
            transform={`rotate(${angle} 20 20)`}
          />
        ))}
        {/* Gold center */}
        <circle cx="20" cy="20" r="4" fill="#C6A86C" />
      </svg>
      <span
        className="font-display"
        style={{ fontSize: 14 * scale, color: textColor, lineHeight: 1.2 }}
      >
        Prospera
      </span>
      <span
        className="font-sans uppercase tracking-[2px]"
        style={{ fontSize: 8 * scale, color: subtextColor, lineHeight: 1.2 }}
      >
        método mamãe monetiza
      </span>
    </div>
  );
};

export default Logo;