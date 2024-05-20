"use client"

import React from "react";

import { Card } from "@/components/ui/card";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MdInbox } from "react-icons/md";


const ChatTab = () => {
    const pathname = usePathname();

    return (
        <Card className={
            cn("flex col-span-1 xl:col-span-2 justify-center items-center",
                pathname === "/dashboard/chat" ? "hidden md:flex" : "flex"
            )}
        >
            <div className="flex flex-col items-center">
                <MdInbox className="w-12 h-12 text-slate-500" />
                <p className="text-slate-500 text-lg font-semibold">
                    Select a chat
                </p>
            </div>
        </Card>
    );
}

export default ChatTab;