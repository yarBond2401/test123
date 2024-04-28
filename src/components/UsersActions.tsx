import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import React, { useContext } from "react";
import { MdMoreVert } from "react-icons/md";

import { TableContext } from "@/app/dashboard/broker/components/context-table";
import { PublicUser } from "@/app/dashboard/broker/schema";
import { db } from "@/app/firebase";
import { Row } from "@tanstack/react-table";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "./ui/use-toast";

interface Props {
  row: Row<PublicUser>;
}

export const UsersActions: React.FC<Props> = ({ row }) => {
  const { mutate } = useContext(TableContext);

  const removeAgentHandler = async () => {
    const docRef = doc(db, "brokers", row.original.brokerId);
    await updateDoc(docRef, {
      users: arrayRemove(row.original.uid),
    });
    toast({
      title: "Success",
      description: "Agent removed",
    });
    mutate();
  };

  const makeAdminHandler = async () => {
    const docRef = doc(db, "brokers", row.original.brokerId);
    await updateDoc(docRef, {
      admins: arrayUnion(row.original.uid),
    });
    toast({
      title: "Success",
      description: "Agent promoted to admin",
    });
    mutate();
  };

  const downgradeToAgentHandler = async () => {
    const docRef = doc(db, "brokers", row.original.brokerId);
    await updateDoc(docRef, {
      admins: arrayRemove(row.original.uid),
    });
    toast({
      title: "Success",
      description: "Admin downgraded to agent",
    });
    mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex">
          <MdMoreVert />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        {row.original.you ? (
          <DropdownMenuItem
            onClick={removeAgentHandler}
          >Leave broker</DropdownMenuItem>
        ) : row.original.admin ? (
          <DropdownMenuItem onClick={downgradeToAgentHandler}>
            Downgrade to agent
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={makeAdminHandler}>
              Make admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={removeAgentHandler}>
              Remove agent
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
