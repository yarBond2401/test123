import {
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";

import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import React, { useEffect } from "react";
import { PublicUser } from "../schema";
import { User } from "firebase/auth";
import { Card } from "@/components/ui/card";

interface Props {
  columns: ColumnDef<PublicUser>[];
  rows: PublicUser[];
  isAdmin: boolean;
}

export const DataTable: React.FC<Props> = ({ columns, rows, isAdmin }) => {
  const table = useReactTable({
    columns: columns,
    data: rows,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (!isAdmin) {
      table.setColumnVisibility({ actions: false });
    }
  }, [isAdmin, table]);

  return (
    <Card className="shadow-none mt-4">
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
