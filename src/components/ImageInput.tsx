import Image from "next/image";

import placeholderImage from "@/images/placeholder-image.jpg";
import { CardDescription } from "./ui/card";
import { useDropzone } from "react-dropzone";
import { MdDeleteOutline, MdUpload, MdCloudUpload } from "react-icons/md";
import { Button } from "./ui/button";
import ReactCrop, { type PixelCrop, type Crop } from "react-image-crop";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/app/firebase";
import { nanoid } from "nanoid";
import useMeasure from "react-use-measure";
import { toast } from "./ui/use-toast";
import 'react-image-crop/dist/ReactCrop.css';

interface Props {
  storagePath: string;
  imageName?: string;
  value: string;
  onChange: (value: string) => void;
}

const ImageInput: React.FC<Props> = (props) => {
  const roundCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const squareCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [uncroppedImage, setUncroppedImage] = React.useState<string>("");
  const [croppedImage, setCroppedImage] = React.useState<PixelCrop>();
  const [ref, bounds] = useMeasure();

  const removeSelectedImage = () => {
    props.onChange("");
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setUncroppedImage(URL.createObjectURL(acceptedFiles[0]));
  };

  useEffect(() => {
    if (!bounds.width || !bounds.height) return;

    const minDimension = Math.min(bounds.width, bounds.height);
    const currentCrop: Crop = {
      unit: "px",
      x: (bounds.width - minDimension) / 2,
      y: (bounds.height - minDimension) / 2,
      width: minDimension,
      height: minDimension
    }
    setCrop(currentCrop);
  }, [bounds])

  useEffect(() => {
    if (croppedImage?.height && croppedImage?.width &&
      imageRef.current && roundCanvasRef.current && squareCanvasRef.current
    ) {
      canvasPreview(imageRef.current, roundCanvasRef.current, croppedImage, 1, 0)
      canvasPreview(imageRef.current, squareCanvasRef.current, croppedImage, 1, 0)
    }
  }, [croppedImage])

  const onSubmit = async () => {
    const image = imageRef.current
    const previewCanvas = roundCanvasRef.current

    if (!image || !croppedImage || !previewCanvas) {
      throw new Error('Crop canvas does not exist')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const offScreenCanvas = new OffscreenCanvas(croppedImage.width * scaleX, croppedImage.height * scaleY)
    const offScreenCanvasContext = offScreenCanvas.getContext('2d')

    if (!offScreenCanvasContext) {
      throw new Error('No 2d context')
    }

    offScreenCanvasContext.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offScreenCanvas.width,
      offScreenCanvas.height
    )

    let quality;
    if (offScreenCanvas.width > 1000) {
      quality = 0.4
    } else {
      quality = 0.8
    }

    const blob = await offScreenCanvas.convertToBlob({
      type: 'image/png',
      quality
    })

    if (blob.size > 1 * 1024 * 1024) {
      toast({
        title: 'Image too large',
        description: 'Please upload an image below 1MB',
      })
      return
    }

    const uid = nanoid()
    const extension = "png"

    const sR = storageRef(
      storage,
      props.imageName
        ? `${props.storagePath}${props.imageName}.${extension}`
        : `${props.storagePath}${uid}.${extension}`
    );

    const uploadTask = uploadBytesResumable(sR, blob);
    setLoading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          props.onChange(downloadURL);
        });
        setLoading(false);
        setProgress(0);
      }
    );

  }

  const handleDelete = () => {
    props.onChange("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <figure>
        <Image
          src={props.value ? props.value : placeholderImage}
          alt="User uploaded image"
          width={500}
          height={500}
          className="shadow-md w-24 h-24 border rounded-md object-cover"
        />
      </figure>
      <div>
        <h5 className="font-semibold">Upload an image</h5>
        <CardDescription>We support PNGs, JPEGs under 1MB</CardDescription>
        <div className="flex flex-row gap-4 mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button">
                <MdUpload className="mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="mb-4">
                  Upload profile picture
                </DialogTitle>
                <div
                  {...getRootProps()}
                  onClick={(e) => e.stopPropagation()}
                  className={uncroppedImage ? "hidden" : ""}
                >
                  <label
                    htmlFor="dropzone-file"
                    className="relative flex flex-col items-center justify-center w-full py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    {loading && (
                      <div className=" text-center max-w-md  ">
                        <Progress value={progress} />
                        <p className=" text-sm font-semibold">
                          Uploading Picture
                        </p>
                        <p className=" text-xs text-gray-400">
                          Do not refresh or perform any other action while the
                          picture is being upload
                        </p>
                      </div>
                    )}
                    {!loading && !uncroppedImage && (
                      <div className=" text-center">
                        <div className=" border p-2 rounded-md max-w-min mx-auto">
                          <MdCloudUpload size="1.6em" />
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Drag an image</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          Click to upload &#40; image should be square and below
                          5MB &#41;
                        </p>
                      </div>
                    )}
                  </label>
                  <Input
                    id="dropzone-file"
                    className="hidden"
                    {...getInputProps()}
                  />
                </div>
                {!loading && uncroppedImage && (
                  <div className="text-center" onClick={
                    (e) => e.stopPropagation()
                  }>
                    {
                      uncroppedImage &&
                      <div className="flex flex-col items-center gap-2 flex-1 sm:flex-row">
                        <div
                          className="mt-2 mb-3"
                        >
                          <ReactCrop
                            crop={crop}
                            style={{ borderRadius: "50%" }}
                            onComplete={(completed) => {
                              setCroppedImage(completed)
                            }}
                            onChange={(_crop) => {
                              setCrop(_crop)
                            }}
                            aspect={1}
                            minHeight={100}
                            minWidth={100}
                          >
                            <figure
                              ref={ref}
                            >
                              <img
                                src={uncroppedImage}
                                ref={imageRef}
                                onLoad={() => {
                                
                                }}
                                className=" w-full object-contain max-h-md mx-auto"
                                alt="uploaded image"
                              />
                            </figure>
                          </ReactCrop>
                        </div>
                        <div
                          className="flex flex-col gap-4 items-start self-stretch flex-1"
                        >
                          <h2 className="text-lg font-semibold self-center">
                            Preview
                          </h2>
                          <div className="flex flex-row justify-around w-full">
                            <canvas
                              ref={roundCanvasRef}
                              className="aspect-square rounded-full h-20 bg-slate-300"
                            />
                            <canvas
                              ref={squareCanvasRef}
                              className="aspect-square rounded-md h-20 bg-slate-300"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => setUncroppedImage("")}
                            variant="outline"
                            className="flex gap-2 w-full"
                          // className="self-stretch"
                          >
                            Cancel
                            <MdDeleteOutline className="h-full aspect-square" size="20px" />
                          </Button>
                        </div>
                      </div>}
                  </div>
                )}
                {/* <p className=" text-sm font-semibold">
                  Picture Uploaded
                </p>
                <p className=" text-xs text-gray-400">
                  Click submit to upload the picture
                </p> */}
              </DialogHeader>
              <DialogFooter
                className="flex gap-2"
              >
                <DialogClose asChild>
                  <Button
                    onClick={removeSelectedImage}
                    type="button"
                    variant="secondary"
                  >
                    Close
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={onSubmit}
                    // disabled={selectedImage}
                    type="button"
                  >
                    Submit
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="secondary" type="button" onClick={handleDelete}>
            <MdDeleteOutline className="h-full aspect-square" size="20px" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageInput;

const TO_RADIANS = Math.PI / 180

export async function canvasPreview(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  // devicePixelRatio slightly increases sharpness on retina devices
  // at the expense of slightly slower render times and needing to
  // size the image back down if you want to download/upload and be
  // true to the images natural size.
  const pixelRatio = window.devicePixelRatio
  // const pixelRatio = 1

  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'

  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY

  const rotateRads = rotate * TO_RADIANS
  const centerX = image.naturalWidth / 2
  const centerY = image.naturalHeight / 2

  ctx.save()

  // 5) Move the crop origin to the canvas origin (0,0)
  ctx.translate(-cropX, -cropY)
  // 4) Move the origin to the center of the original position
  ctx.translate(centerX, centerY)
  // 3) Rotate around the origin
  ctx.rotate(rotateRads)
  // 2) Scale the image
  ctx.scale(scale, scale)
  // 1) Move the center of the image to the origin (0,0)
  ctx.translate(-centerX, -centerY)
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  )

  ctx.restore()
}
