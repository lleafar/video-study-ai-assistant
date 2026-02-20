import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SidebarItem({
  children,
  route,
  label,
  onClick,
}: {
  children?: React.ReactNode;  
  route: string;
  label: string;
  onClick?: () => void;
}) {

  const pathname = usePathname();
  const selected = pathname === route;


  return (
    <div className="flex-col">
      <div className={`w-full h-full rounded-l-full transition-colors ${selected ? "bg-zinc-900" : "bg-transparent hover:bg-zinc-600/30"} `}>
        <Link
          href={route}
          onClick={onClick}
          className="relative z-10 px-4 py-2 rounded flex flex-col items-start gap-3 text-sm"
        >          
          {children && children}
          <p className="truncate w-full">{label}</p>
        </Link>
      </div>
    </div>
  );
}
