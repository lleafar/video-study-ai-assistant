"use client";

export default function SwitchLayoutButton({
  isStacked,
}: {
  isStacked: boolean;
}) {
  const rect1Style = !isStacked
    ? "group-hover:w-[18px] group-hover:h-[10px]"
    : "group-hover:w-2.5 group-hover:h-5.75";
  const rect2Style = !isStacked
    ? "group-hover:w-[18px] group-hover:h-[10px] group-hover:-translate-x-3.25 group-hover:translate-y-3.25"
    : "group-hover:w-2.5 group-hover:h-5.75 group-hover:translate-x-3.25 group-hover:-translate-y-3.25";

  return (
      <svg
        viewBox="1 1 33 25"
        fill="none"
        xmlns="http://www.w3.org"
        className="size-5 block stroke-2 stroke-zinc-300 group"
      >
        <rect
          x="2"
          y="2"
          width="5"
          height="23"
          rx="2"
          stroke="inherit"
          strokeWidth="inherit"
        />
        <rect
          className={`${rect1Style} transition-all duration-300`}
          x="10"
          y="2"
          width={!isStacked ? "10" : "18"}
          height={!isStacked ? "23" : "10"}
          rx="2"
          stroke="inherit"
          strokeWidth="inherit"
          style={{ transformBox: "fill-box" }}
        />
        <rect
          className={`${rect2Style} transition-all duration-300`}
          x={!isStacked ? "23" : "10"}
          y={!isStacked ? "2" : "15"}
          width={!isStacked ? "10" : "18"}
          height={!isStacked ? "23" : "10"}
          rx="2"
          stroke="inherit"
          strokeWidth="inherit"
          style={{ transformBox: "fill-box" }}
        />
      </svg>
  );
}
