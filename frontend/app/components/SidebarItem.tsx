import { useEffect, useState } from "react";

export default function SidebarItem({
  children,
  route,
  label,
  onClick,
}: {
  children?: React.ReactNode;
  icon?: string;
  route: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(window.location.pathname === route);
  }, [route]);

  return (
    <div className="flex-col">
      <div className={`w-full h-full rounded-l-full ${selected ? "bg-zinc-900" : "bg-transparent hover:bg-zinc-600/30"} `}>
        <a
          href={route}
          onClick={onClick}
          className="relative z-10 px-4 py-2 rounded flex flex-col items-start gap-3 transition-colors text-sm"
        >
          {children && children}
          {label}
        </a>
      </div>
    </div>
  );
}
