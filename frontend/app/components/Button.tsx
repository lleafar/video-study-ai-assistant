import Link from "next/link";

export default function Button({
  className,
  children,
  route,
  styleType = "primary",
  type = "default",
  onClick,
  loading = false,
}: {
  className?: string;
  children?: React.ReactNode;
  route?: string;
  styleType?: "primary" | "secondary" | "tertiary";
  type?: "default" | "submit";
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  loading?: boolean;
}) {
  const styles = {
    primary: {
      base: `flex items-center rounded-full shadow-md ${type === "submit" ? "font-semibold text-indigo-300 bg-blue-200/20 hover:bg-blue-300/10 shadow-md" : "bg-zinc-950/30"} hover:bg-zinc-600/30 transition-colors text-sm`,
      link: "relative flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2 w-full",
    },
    secondary: {
      base: `flex items-center rounded-full ${type === "submit" ? "font-semibold text-indigo-300 border-2! border-indigo-300!" : ""} hover:bg-zinc-600/30 transition-colors text-sm`,
      link: "relative flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2 w-full",
    },
    tertiary: {
      base: "hover:opacity-70 transition-opacity cursor-pointer",
      link: "relative flex items-center min-w-0 overflow-hidden px-4 py-2 gap-2",
    },
  };

  return (
    <div
      className={
        (styles[styleType]?.base || styles["primary"].base) +
        (className || "") +
        (loading ? " pointer-events-none animate-pulse" : "")
      }
    >      
      {route ? (
        <Link
          href={route}
          onClick={onClick}
          className={styles[styleType]?.link || styles["primary"].link}
        >
          {children}
        </Link>
      ) : (        
      <button
        onClick={onClick}
        className={styles[styleType]?.link || styles["primary"].link}
      >
        {children}
      </button>
      )}
    </div>
  );
}
