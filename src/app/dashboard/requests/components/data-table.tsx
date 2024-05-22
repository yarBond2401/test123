import React from 'react';

import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { ServiceRequestWithUsers } from '../schema';
import { useRouter } from 'next/navigation';
import { DocumentData } from 'firebase/firestore';

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
  columns: ColumnDef<DocumentData>[];
  rows: DocumentData[];
}

export const SingInDataTable: React.FC<SingInProps> = ({ columns, rows }) => {
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
