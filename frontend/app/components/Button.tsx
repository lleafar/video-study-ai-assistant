export default function Button({
  className,
  children,
  route,
  styleType = "primary",
  onClick,
}: {
  className?: string;
  children?: React.ReactNode;
  route?: string;
  styleType?: "primary" | "secondary" | "tertiary";
  onClick?: () => void;
}) {
  const styles = {
    primary: {
      base: "flex items-center rounded-full hover:bg-zinc-600/30 transition-colors text-sm",
      link: "relative z-10  flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
    },
    secondary: {
      base: "",
      link: "",
    },
    tertiary: {
      base: "hover:opacity-70 transition-opacity cursor-pointer",
      link: "relative z-10  flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
    },
  };

  return (
    <div
      className={
        (styles[styleType]?.base || styles["primary"].base) +
        " " +
        (className || "")
      }
    >
      <a
        href={route}
        onClick={onClick}
        className={styles[styleType]?.link || styles["primary"].link}
      >
        {children}
      </a>
    </div>
  );
}
