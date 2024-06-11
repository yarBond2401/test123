import React, { useState, useEffect, FC } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { db } from '@/app/firebase';
import { collection, query, where, getDocs, getDoc, DocumentData } from 'firebase/firestore';

interface Service {
	serviceName: string;
	duration: number;
	pricePerHour: number;
}

interface Location {
	latitude: number;
	longitude: number;
}

interface DataProps {
	datetime: string;
	requestName: string;
	location?: Location;
	services?: Service[];
}

interface ServiceDetailsDialogProps {
	data: DataProps;
}

const ServiceDetailsDialog: FC<ServiceDetailsDialogProps> = ({ data }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [service, setService] = useState<DocumentData | null>(null);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const calculatePrice = (duration: number, pricePerHour: number): number => {
		return duration * pricePerHour;
	};

	return (
		<div>
			<Button onClick={handleOpen}>View Details</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Service Details</DialogTitle>
						<DialogClose />
					</DialogHeader>
					{service ? (
						<div>
							<div>Date: {data.datetime}</div>
							<div>Request Name: {data.requestName}</div>
							<div>Location: Latitude {data.location?.latitude}, Longitude {data.location?.longitude}</div>
							<div>Services:</div>
							<ul>
								{data.services?.map((s, index) => (
									<li key={index}>
										<div>Service Name: {s.serviceName}</div>
										<div>Duration: {s.duration} hours</div>
										<div>Price per Hour: ${s.pricePerHour}</div>
										<div>Total Price: ${calculatePrice(s.duration, s.pricePerHour)}</div>
									</li>
								))}
							</ul>
						</div>
					) : (
						<div>Loading...</div>
					)}
					<Button onClick={handleClose}>Close</Button>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ServiceDetailsDialog;
