import React from "react";

import { db } from "@/app/firebase";
import { doc, deleteDoc, DocumentData } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Row } from "@tanstack/react-table";

import {ServiceRequestWithUsers, ServiceSignInRequestCreate, ServiceSignInRequestSchema} from "../schema";
import { MdMoreVert } from "react-icons/md";
import { toast } from "@/components/ui/use-toast";

interface Props {
  row: Row<ServiceRequestWithUsers>;
}

export const RequestActions: React.FC<Props> = ({ row }) => {
  const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    let docRef = doc(db, "requests", row.original.id);
    await deleteDoc(docRef);
    toast({
      title: "Success",
      description: "Request deleted",
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex" variant="ghost" type="button">
          <MdMoreVert />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {["issued", "resolved"].includes(row.original.status) && (
          <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface SingInProps {
  row: Row<ServiceSignInRequestSchema>;
  deleteElement: (id: string) => void;
}

export const SinInRequestActions: React.FC<SingInProps> = ({ row, deleteElement }) => {
  const handleDelete = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    let docRef = doc(db, "signInRequests", row.original.id);
    await deleteDoc(docRef);
    deleteElement(row.original.id);
    toast({
      title: "Success",
      description: "Request deleted",
    });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={row.original.status !== 'Pending Install'} className="flex" variant="ghost" type="button">
          <MdMoreVert />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
