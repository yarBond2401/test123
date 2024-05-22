import { ColumnDef } from "@tanstack/react-table";
import {
  ServiceRequest,
  ServiceRequestWithUsers,
  ServiceSignInRequestCreate,
  ServiceSignInRequestCreateFromDb, ServiceSignInRequestSchema
} from "../schema";
import { UsersActions } from "@/components/UsersActions";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { RequestActions, SinInRequestActions } from "./request-actions";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { DocumentData } from "firebase/firestore";

export const columns: ColumnDef<ServiceRequestWithUsers>[] = [
  {
    id: "createdBy",
    header: () => <>Created By</>,
    cell: ({ row }) => (
      <>
        <div className="flex items-center gap-1">
          {
            row.original?.userDetails?.photoURL ?
              <>
                <Image
                  src={row.original.userDetails.photoURL}
                  width={32}
                  height={32}
                  className="rounded-full"
                  alt={`${row.original.userDetails.displayName} profile picture`}
                />
                <p>
                  {row.original.userDetails.displayName || "User Name"}
                </p>
              </> :
              <>
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-20 h-4" />
              </>
          }
        </div>
      </>
    ),
  },
  {
    id: "createdAt",
    header: () => <>Created At</>,
    cell: ({ row }) => (
      <>
        <div className="flex items-center gap-1">
          <p>
            {format(row.original.createdAt.toDate(), "dd/MM/yyyy")}
          </p>
        </div>
      </>
    ),
  },
  {
    id: "status",
    header: () => <>Status</>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Badge>
          {row.original.status}
        </Badge>
      </div>
    ),
  },
  {
    id: "services_number",
    header: () => <>Number of services</>,
    cell: ({ row }) => (
      <p>
        {row.original.services
          ? row.original.services.length
          : "Sing Installation"
        }
      </p>
    ),
  },
  {
    id: "actions",
    header: () => <>Actions</>,
    cell: ({ row }) => (
      <>
        <RequestActions row={row} />
      </>
    ),
  },
];


export const singInstallColumns: ColumnDef<ServiceSignInRequestSchema>[] = [
  {
    id: "createdBy",
    header: () => <>Created By</>,
    cell: ({ row }) => (
      <>
        <div className="flex items-center gap-1">
          {
            row.original?.userInfo ?
              <>
                <Image
                  src={row.original.userInfo.photoURL || defaultAvatar }
                  width={32}
                  height={32}
                  className="rounded-full"
                  alt={`${row.original.userInfo.displayName} profile picture`}
                />
                <p>
                  {row.original.userInfo.displayName}
                </p>
              </> :
              <>
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-20 h-4" />
              </>
          }
        </div>
      </>
    ),
  },
  {
    id: "createdAt",
    header: () => <>Created At</>,
    cell: ({ row }) => (
      <>
        <div className="flex items-center gap-1">
          <p>
            {format(row.original.createdAt.toDate(), "dd/MM/yyyy")}
          </p>
        </div>
      </>
    ),
  },
  {
    id: "status",
    header: () => <>Status</>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Badge>
          {row.original.status}
        </Badge>
      </div>
    ),
  },
  {
    id: "services_number",
    header: () => <>Number of services</>,
    cell: ({ row }) => (
      <p>
        Sing Installation
      </p>
    ),
  },
  {
    id: "actions",
    header: () => <>Actions</>,
    cell: ({ row }) => (
      <>
        <SinInRequestActions row={row} />
      </>
    ),
  },
];
