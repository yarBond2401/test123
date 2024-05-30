import React from 'react';

import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { ServiceRequestWithUsers, ServiceSignInRequestSchema } from '../schema';
import { useRouter } from 'next/navigation';
import { DocumentData } from 'firebase/firestore';
import Image from "next/image";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SinInRequestActions } from "@/app/dashboard/requests/components/request-actions";

interface Props {
  columns: ColumnDef<ServiceRequestWithUsers>[];
  rows: ServiceRequestWithUsers[];
}

export const DataTable: React.FC<Props> = ({ columns, rows }) => {
  const table = useReactTable({
    columns: columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  });

  const router = useRouter();

  return (
    <Card className="shadow-none mt-4">
      {
        // if non rows, show empty state
        table.getRowModel().rows.length > 0 ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}
                  onClick={() => {
                    router.push(`/dashboard/requests/${row.original.id}`);
                  }}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-40">
            No data available
          </div>
        )
      }
    </Card>
  );
};

interface SingInProps {
  rows: ServiceSignInRequestSchema[];
  setRequests: React.Dispatch<React.SetStateAction<ServiceSignInRequestSchema[]>>
}

export const SingInDataTable: React.FC<SingInProps> = ({ rows, setRequests }) => {

  const deleteElement = (id: string) => {
    setRequests(currentData => currentData.filter((item => item.id !== id)));
  }

  const columns: ColumnDef<ServiceSignInRequestSchema>[] = [
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
                    src={row.original.userInfo.photoURL || defaultAvatar}
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
          <SinInRequestActions row={row} deleteElement={deleteElement} />
        </>
      ),
    },
  ];

  const table = useReactTable({
    columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="shadow-none mt-4">
      {
        // if non rows, show empty state
        table.getRowModel().rows.length > 0 ? (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex items-center justify-center h-40">
            No data available
          </div>
        )
      }
    </Card>
  );
};
