import React from "react";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ResourceActionsMenuProps {
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ResourceActionsMenu({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ResourceActionsMenuProps) {
  const hasActions = canEdit || canDelete;

  if (!hasActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label="Mở menu thao tác"
        >
          <MoreVertical size={15} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-44 rounded-xl border-slate-200 bg-white p-1 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {canEdit && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onEdit?.();
            }}
            className="cursor-pointer rounded-lg px-3 py-2 text-slate-700 focus:bg-slate-100"
          >
            <Edit2 size={15} />
            Chỉnh sửa
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              onDelete?.();
            }}
            className="cursor-pointer rounded-lg px-3 py-2 text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 size={15} />
            Xóa
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
