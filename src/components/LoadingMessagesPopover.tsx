import { Skeleton } from "@/components/ui/skeleton";

interface LoadingMessagesPopoverProps {
    count?: number;
}

export const LoadingMessagesPopover: React.FC<LoadingMessagesPopoverProps> = ({ count = 3 }) => {
    return (
        <>
            {
                Array.from({ length: count }).map((_, index) => (
                    <div key={index} className="flex items-center w-full mb-2 gap-4">
                        <Skeleton className="flex-none h-14 w-14 rounded-full" />
                        <div className="flex flex-col gap-2 w-full">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))
            }
        </>
    );
}