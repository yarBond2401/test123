import React, { useState, useEffect, FC } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { db } from '@/app/firebase';
import { collection, query, where, getDocs, getDoc, DocumentData, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/use-toast';
import { NewButton } from '@/components/ui/new-button';

interface ServiceDetailsDialogProps {
	id: string;
	button?: HTMLElement,
}

const ServiceDetailsDialog: FC<ServiceDetailsDialogProps> = ({ id, button }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [data, setData] = useState<any | null>(null);

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleAccept = async () => {
		let docRef = doc(db, "offers", row.original.id);
		await updateDoc(docRef, { status: "accepted", acceptedAt: serverTimestamp() });
		toast({
			title: "Success",
			description: "Offer accepted",
			type: "success",
		});
	};

	const handleReject = async () => {
		let docRef = doc(db, "offers", row.original.id);
		await updateDoc(docRef, { status: "rejected", rejectedAt: serverTimestamp() });
		toast({
			title: "Success",
			description: "Offer rejected",
			type: "success",
		});
	};

	useEffect(() => {
		console.log(id);
		if (id) {
			getDoc(doc(db, "offers", id)).then((doc) => {
				setData(doc.data());
				console.log(doc.data());
			});
		}
	}, [id]);

	return (
		<div>
			<Button onClick={handleOpen}>View Details</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Offer Details</DialogTitle>
						<DialogClose />
					</DialogHeader>
					{data ? (
						<div>
							<div>Date: {data?.offerDate.toDate()}</div>
							<div>Statur: {data?.status}</div>
							<div>Costs: {data?.vendorCosts}</div>
						</div>
					) : (
						<Spinner size="medium" />
					)}
					<DialogFooter className="w-full align-middle flex flex-row justify-between sm:justify-between mt-2">
						<Button variant="secondary" onClick={handleClose}>Close</Button>
						{status === "pending" && (
							<div className="flex flex-row gap-2">
								<Button onClick={() => handleReject()} variant="destructive">Reject</Button>
								<Button className="px-6" onClick={() => handleAccept()}>Accept</Button>
							</div>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ServiceDetailsDialog;
