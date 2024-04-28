import { ColumnDef } from "@tanstack/react-table";
import { PublicUser } from "../schema";
import Image from "next/image";
import { DEFAULT_USER_IMAGE } from "@/app/constants";
import { UsersActions } from "@/components/UsersActions";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<PublicUser>[] = [
  {
    id: "name",
    header: () => <>Name</>,
    cell: ({ row }) => (
      <>
        <div className="flex items-center gap-1">
          <Image
            src={row.original.photoURL || DEFAULT_USER_IMAGE}
            alt={`${row.original.displayName} photo`}
            width="40"
            height="40"
            className="aspect-square rounded-full object-cover"
          />
          {row.original.displayName}
        </div>
      </>
    ),
  },
  {
    id: "email",
    header: () => <>Email</>,
    cell: ({ row }) => <>{row.original.email}</>,
  },
  {
    id: "roles",
    header: () => <>Roles</>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        {
          row.original.admin
            ? <Badge variant="default">Admin</Badge>
            : <Badge variant="secondary">Agent</Badge>
        
        }
        {
          row.original.you && <Badge variant="outline">You</Badge>
        }
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <>Actions</>,
    cell: ({ row }) => (
      <>
        <UsersActions
          row={row}
        />
      </>
    ),
  }
];
