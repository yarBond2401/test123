"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLayoutEffect, useState } from "react";
import { useParams } from "next/navigation";
import { posts } from "@/mock/postsMock";
import { Post } from "@/mock/types";
import Loading from "../loading";

const OfferDetails = () => {
  const [post, setPost] = useState<Post>();
  const params = useParams<{ "post-id": string }>();
  const postId = params["post-id"];

  useLayoutEffect(() => {
    const currentPost = posts.find((post) => post.id === postId);
    setPost(currentPost);
  }, [postId]);

  const handleAccept = () => {
    console.log("accept");
  }

  if (!post) {
    return <Loading />;
  }

  const total = post.tax + post.subtotal;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offer Details</CardTitle>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="flex shadow bg-white border border-[#DFE4EA] rounded-10 flex-col p-6 pb-11 max-w-[532px] gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-lg text-[#111928] font-medium">Test Service</p>
            <p className="text-dashboard-secondary text-lg leading-6">
              Service for {post.date}, 14:47
            </p>
          </div>

          {post?.services.map((service) => {
            return (
              <div key={service.name} className="flex flex-col gap-2">
                <p className="text-lg text-[#111928] font-medium">
                {service.name}
                </p>
                <p className="text-dashboard-secondary text-lg leading-6">
                {service.duration}h
                </p>
              </div>
            );
          })}

          <div className="flex flex-col gap-[15px] w-full">
            <div className="flex flex-row justify-between w-full text-dashboard-secondary text-base font-medium">
              <p>Subtotal</p>
              <p>${post.subtotal}</p>
            </div>
            <div className="flex flex-row justify-between w-full text-dashboard-secondary text-base font-medium">
              <p>Tax</p>
              <p>${post.tax}</p>
            </div>
            <div className="flex flex-row justify-between w-full text-[#111928] text-base font-medium">
              <p>Total</p>
              <p>${total}</p>
            </div>
          </div>

          <button type="button"
            onClick={handleAccept}
            className="w-full py-3 bg-[#5352BF] text-base font-medium text-white rounded-md hover:bg-[#1B44C8]">Accept</button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfferDetails;
