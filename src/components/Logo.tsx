interface LogoProps {
  size?: number;
  light?: boolean;
}

const Logo = ({ size = 48, light = false }: LogoProps) => {
  const src = light ? "/prospera-logo-escuro.png" : "/prospera-logo-claro.png";

  return (
    <img
      src={src}
      alt="Prospera"
      style={{ height: size, width: "auto" }}
      className="object-contain"
    />
  );
};

export default Logo;