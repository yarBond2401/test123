import React from 'react';

import { Card } from '@/components/ui/card';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Image from "next/image";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdMoreVert } from "react-icons/md";

interface OffersProps {
	rows: any[];
	setOffers: React.Dispatch<React.SetStateAction<any[]>>
}

export const OffersDataTable: React.FC<OffersProps> = ({ rows, setOffers }) => {

	const deleteElement = (id: string) => {
		setOffers(currentData => currentData.filter((item => item.id !== id)));
	}

	const columns: ColumnDef<any>[] = [
		{
			id: "createdBy",
			header: () => <>Created By</>,
			cell: ({ row }) => (
				<>
					<div className="flex items-center gap-1">
						{
							row.original?.userDetails ?
								<>
									<Image
										src={row.original.userDetails.photoURL || defaultAvatar}
										width={32}
										height={32}
										className="rounded-full"
										alt={`${row.original.userDetails.displayName} profile picture`}
									/>
									<p>
										{row.original.userDetails.displayName}
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
			id: "vendor",
			header: () => <>Vendor</>,
			cell: ({ row }) => (
				<>
					<div className="flex items-center gap-1">
						{
							row.original?.vendorDetails ?
								<>
									<Image
										src={row.original.vendorDetails.photoURL || defaultAvatar}
										width={32}
										height={32}
										className="rounded-full"
										alt={`${row.original.vendorDetails.displayName} profile picture`}
									/>
									<p>
										{row.original.vendorDetails.displayName}
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
			id: "actions",
			header: () => <>Actions</>,
			cell: ({ row }) => (
				<>
					<OffersActions row={row} deleteElement={deleteElement} />
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


export const OffersActions: React.FC<SingInProps> = ({ row, deleteElement }) => {
	// const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
	// 	e.stopPropagation();
	// 	let docRef = doc(db, "offers", row.original.id);
	// 	await deleteDoc(docRef);
	// 	deleteElement(row.original.id);
	// 	toast({
	// 		title: "Success",
	// 		description: "Request deleted",
	// 	});
	// };

	const handleDelete = async () => { };
	const handleEdit = async () => { };

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="flex" variant="ghost" type="button">
					<MdMoreVert />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={handleDelete} disabled={row.original.offerStatus === 'accepted'} >Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};