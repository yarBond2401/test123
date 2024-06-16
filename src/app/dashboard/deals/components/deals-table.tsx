import React from "react";

import { Card } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
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
import { deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { db } from "@/app/firebase";
import { useOfferDetails } from "@/hooks/useOfferDetails";

interface DealsProps {
	rows: any[];
	setDeals: React.Dispatch<React.SetStateAction<any[]>>;
}

export const DealsDataTable: React.FC<DealsProps> = ({ rows, setDeals }) => {
	const deleteElement = (id: string) => {
		setDeals((currentData) => currentData.filter((item) => item.id !== id));
	};
	console.log(rows);

	const columns: ColumnDef<any>[] = [
		{
			id: "vendor",
			header: () => <>Vendor</>,
			cell: ({ row }) => (
				<>
					<div className="flex items-center gap-1">
						{row.original?.agentDetails ? (
							<>
								<Image
									src={row.original.agentDetails.photoURL || defaultAvatar}
									width={32}
									height={32}
									className="rounded-full"
									alt={`${row.original.agentDetails.displayName} profile picture`}
								/>
								<p>{row.original.agentDetails.displayName}</p>
							</>
						) : (
							<>
								<Skeleton className="w-8 h-8 rounded-full" />
								<Skeleton className="w-20 h-4" />
							</>
						)}
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
						<p>{format(row.original.createdAt.toDate(), "dd/MM/yyyy")}</p>
					</div>
				</>
			),
		},
		{
			id: "status",
			header: () => <>Status</>,
			cell: ({ row }) => (
				<div className="flex gap-2 items-center">
					<Badge>{row.original.status}</Badge>
				</div>
			),
		},

		{
			id: "actions",
			header: () => <>Actions</>,
			cell: ({ row }) => (
				<>
					<DealsActions row={row} deleteElement={deleteElement} updateElementStatus={updateElementStatus} />
				</>
			),
		},
	];

	const table = useReactTable({
		columns,
		data: rows,
		getCoreRowModel: getCoreRowModel(),
	});

	const updateElementStatus = (id, newStatus) => {
		setDeals((currentData) =>
			currentData.map((item) =>
				item.id === id ? { ...item, status: newStatus } : item
			)
		);
	};


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
													header.getContext(),
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
												cell.getContext(),
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

interface DealsActionsProps {
	row: any;
	deleteElement: (id: string) => void;
	updateElementStatus: (id: string, newStatus: string) => void;
}

export const DealsActions: React.FC<DealsActionsProps> = ({ row, deleteElement, updateElementStatus }) => {
	const handleAccept = async () => {
		let docRef = doc(db, "offers", row.original.id);
		const newStatus = "accepted";
		await updateDoc(docRef, { status: newStatus, acceptedAt: serverTimestamp() });

		// updateElementStatus(row.original.id, newStatus);
		toast({
			title: "Success",
			description: "Offer accepted",
			type: "success",
		});
	};

	const handleViewDetails = async () => {
		const offerId = row.original.id;
	};

	const handleReject = async () => {
		let docRef = doc(db, "offers", row.original.id);
		const newStatus = "rejected";

		await updateDoc(docRef, {
			status: newStatus,
			rejectedAt: serverTimestamp(),
		});

		// Update UI immediately after backend update
		// updateElementStatus(row.original.id, newStatus);

		toast({
			title: "Success",
			description: "Offer rejected",
			type: "success",
		});
	};

	const handleDelete = async () => {
		let docRef = doc(db, "offers", row.original.id);
		await deleteDoc(docRef);
		// deleteElement(row.original.id);
		toast({
			title: "Success",
			description: "Offer deleted",
			type: "success",
		});
	};

	const { openDialog } = useOfferDetails();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="flex" variant="ghost" type="button">
					<MdMoreVert />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem
					onClick={() => handleAccept()}
					disabled={row.original.status === "accepted"}
				>
					Accept
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => openDialog(row.original.id)}
				>
					View Details
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={handleReject}
					disabled={row.original.status === "accepted"}
				>
					Reject
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleDelete}
					disabled={row.original.status === "accepted"}
				>
					Delete
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
