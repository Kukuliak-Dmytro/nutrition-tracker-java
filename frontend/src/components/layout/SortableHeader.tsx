import { ChevronDown, ChevronUp } from "lucide-react";
import { TableHead } from "../ui/table";
import clsx from "clsx";

export function SortableHeader<T extends string>({
  children,
  className = "",
  field,
  sortState,
  onSort,
}: {
  field: T;
  children: React.ReactNode;
  className?: string;
  sortState: { field: T; order: "asc" | "desc" } | undefined;
  onSort: (field: T) => void;
}) {
  const isActive = sortState?.field === field;
  const order = isActive ? sortState?.order : "asc";

  return (
    <TableHead className={clsx(className, "font-semibold cursor-pointer")}>
      <div 
        className={clsx(
          "flex items-center gap-2 text-lg hover:text-foreground transition-colors",
          isActive ? "text-foreground" : ""
        )}
        onClick={() => onSort(field)}
      >
        {children}
        {isActive ? (
          order === "asc" ? (
            <ChevronUp className="h-5 w-5 shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" />
          )
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 opacity-40 transition-opacity duration-200 group-hover:opacity-70" />
        )}
      </div>
    </TableHead>
  )
}