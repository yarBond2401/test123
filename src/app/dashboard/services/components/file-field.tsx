import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { MdDeleteOutline } from 'react-icons/md';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { storage } from '@/app/firebase';
import { Button } from '@/components/ui/button';
import { FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface FileFieldProps {
    value: string;
    path: string;
    onChange: (value: string) => void;
}

export const FileField: React.FC<FileFieldProps> = ({
    value,
    path,
    onChange,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!file) return
        handleUpload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file])

    const handleUpload = async () => {
        if (!file) return
        setLoading(true);
        setProgress(0);

        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on("state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            },
            (error) => {
                console.error(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    onChange(downloadURL);
                    setLoading(false);
                });
            }
        );
    }

    const handleDelete = () => {
        onChange("");
        deleteObject(ref(storage, path)).then(() => {
            toast({
                title: "File deleted",
                description: "The file has been deleted",
            })
        }
        ).catch((error) => {
            console.error("Error deleting file:", error);
        });
        setFile(null);
        setProgress(0);
        const dt = new DataTransfer();
        inputRef.current?.files && inputRef.current.files.length > 0 && dt.items.clear();
        inputRef.current && (inputRef.current.files = dt.files);
    }

    return (
        <>
            <div className="flex flex-row gap-2">
                {
                    value &&
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            inputRef.current?.click();
                        }}
                    >

                        Change file
                    </Button>

                }
                <Input
                    name="file-upload"
                    ref={inputRef}
                    type="file"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                        }
                    }}
                    title="Upload file"
                    accept="pdf"
                    className={cn(
                        "w-full",
                        value ? "hidden" : "block"
                    )}
                >
                </Input>
                {
                    value &&
                    <Button
                        type="button"
                        onClick={handleDelete}
                    >
                        <MdDeleteOutline />
                    </Button>
                }
            </div >
            <div className={cn(
                "flex items-center",
            )} >
                {
                    loading && (

                        <Progress
                            className="w-full"
                            value={progress}
                        />
                    )
                }
                {
                    !loading && value && (
                        <FormDescription>
                            File already uploaded{" "}
                            <a
                                target="_blank"
                                href={value}
                                className="text-blue-500"

                            >
                                Download
                            </a>
                        </FormDescription>
                    )
                }
            </div>
        </>
    )
}