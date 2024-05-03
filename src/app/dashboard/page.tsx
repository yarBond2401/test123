"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as Select from "@radix-ui/react-select";
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

import { useRequireLogin } from "@/hooks/useRequireLogin";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Statistics } from "@/components/dashboard/Statistics";
import { InboxItem } from "@/components/dashboard/InboxItem";

import defaultAvatar from "@/images/default-user-picture.jpg";
import iconStar from "@/icons/icon=star.svg";
import iconDollar from "@/icons/icon=dollar.svg";
import iconWork from "@/icons/icon=work.svg";
import iconWatch from "@/icons/icon=watch.svg";
import { inboxItems } from "@/mock/indoxMock";
import DropdownIcon from "@/icons/icon=chevron-down.svg"
import { dealsMock } from "@/mock/dealsMock";
import { DealItem } from "@/components/dashboard/DealItem";
import { annualEarnedChartData } from "@/mock/annualEarnedChartDataMock";
import { elements } from "chart.js/auto";

const Dashboard = () => {
  const dealStatus = ["Completed (54)", "Active (23)", "All (77)"];
  const [selectedStatus, setSelectedStatus] = useState(dealStatus[0]);
  const router = useRouter();

  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  const optionsBar = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        display: false,
      },
    },
  }

  const optionsLine = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <Separator />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
              <div className="flex bg-white border border-[#DFE4EA] rounded-10 flex-col ">
                <div className="flex flex-row gap-[15px] items-center p-22">
                  <Image
                    src={user?.photoURL || defaultAvatar}
                    width={80}
                    height={80}
                    alt="User profile picture"
                    className="h-20 w-20 rounded-[5px] object-cover border border-[#DFE4EA]"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-dashboard-main text-xl leading-[22px] font-medium">
                      John Strassmann
                    </p>
                    <p className="text-dashboard-secondary text-base leading-[22px] font-medium">
                      Vendor
                    </p>
                  </div>
                </div>

                <Separator />
                <div className="p-22 flex flex-col gap-5 w-full">
                  <div className="flex flex-row justify-between w-full">
                    <p className="text-dashboard-main text-base leading-[22px]">
                      My Level
                    </p>
                    <p className="text-dashboard-main text-base leading-[22px] font-bold">
                      New Seller
                    </p>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <p className="text-dashboard-main text-base leading-[22px]">
                      Success score
                    </p>
                    <p className="text-dashboard-main text-base leading-[22px] font-bold">
                      100%
                    </p>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <p className="text-dashboard-main text-base leading-[22px]">
                      Rating
                    </p>
                    <div className="flex flex-row gap-1">
                      <Image src={iconStar} alt="star" height={16} width={16} />
                      <p className="text-dashboard-main text-base leading-[22px] font-bold">
                        5
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between w-full">
                    <p className="text-dashboard-main text-base leading-[22px]">
                      Response rate
                    </p>
                    <p className="text-dashboard-main text-base leading-[22px] font-bold">
                      80
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 col-span-3">
                <div className="flex flex-row gap-6">
                  <Statistics
                    icon={iconDollar}
                    result="$12.500"
                    total="Earnings"
                    grow="12.0%"
                  />
                  <Statistics
                    icon={iconWork}
                    result="62"
                    total="Jobs"
                    grow="1.0%"
                  />
                  <Statistics
                    icon={iconWatch}
                    result="250"
                    total="Hours"
                    grow="0.43%"
                  />
                </div>
                <div className="flex flex-row gap-6">
                  <div className="flex flex-row w-[321px] px-22 py-7 bg-white border border-[#DFE4EA] rounded-10 items-center">
                    <div className="flex flex-col gap-2">
                      <p className="text-dashboard-main text-2xl leading-[29px] font-bold">
                        $700
                      </p>
                      <p className="text-dashboard-secondary text-base leading-[22px] font-medium">
                        Earned in April
                      </p>
                    </div>
                    <div className="w-1/2 h-16">
                      <Line 
                        data={{
                          labels: ["", "", "", ""],
                          datasets: [{
                            data: [0, 55, 50, 100],
                            backgroundColor: "#A652BF",
                          }]
                        }}
                        options={optionsLine}
                      />
                    </div>
                  </div>

                  <div className="flex flex-row w-[664px] px-22 py-3.5 bg-white border border-[#DFE4EA] rounded-10 items-center">
                    <div className="flex flex-col gap-2">
                      <p className="text-dashboard-main text-2xl leading-[29px] font-bold">
                        $7.500
                      </p>
                      <p className="text-dashboard-secondary text-base leading-[22px] font-medium">
                        Annually Earned{" "}
                      </p>
                    </div>
                    <div className="w-3/4 h-[90px]">
                      <Bar 
                        data={{
                          labels: annualEarnedChartData.map(item => item.label),
                          datasets: [
                            {
                              data: annualEarnedChartData.map(item => item.value1),
                              backgroundColor: "#3758F9",
                              borderRadius: 1,
                            },
                            {
                              data: annualEarnedChartData.map(item => item.value2),
                              backgroundColor: "#13C296",
                              borderRadius: 1,
                            },
                            {
                              data: annualEarnedChartData.map(item => item.value3),
                              backgroundColor: "#F2994A",
                              borderRadius: 1,
                            },
                          ],
                        }}
                        options={optionsBar}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
              <div className="flex flex-col bg-white border border-[#DFE4EA] rounded-10 lg:col-span-1">
                <div className="flex flex-row justify-between p-5">
                  <p className="text-dashboard-main text-xl leading-6 font-medium">
                    Inbox
                  </p>
                  <Link
                    href="/dashboard/chat"
                    className="text-lg leading-[22px] font-medium text-[#5352BF]"
                  >
                    View all
                  </Link>
                </div>
                <Separator />
                <div className="flex flex-col px-5 pt-5">
                  {inboxItems.map((item) => {
                    return <InboxItem key={item.name} item={item} />;
                  })}
                </div>
              </div>
              <div className="flex flex-col bg-white border border-[#DFE4EA] rounded-10 lg:col-span-3">
                <div className="flex flex-row justify-between py-3 px-6 items-center">
                  <p className="text-dashboard-main text-xl leading-6 font-medium">{selectedStatus}</p>
                  <Select.Root value={selectedStatus} onValueChange={setSelectedStatus}>
                    <Select.Trigger className="flex flex-row gap-[10px] px-3 py-2 border border-[#5352BF] rounded-md outline-none items-center text-base text-[#5352BF] hover:bg-violet-50">
                      <Select.Value/>
                      <Select.Icon>
                        <Image src={DropdownIcon} alt="icon" height={18} width={18} />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content className="bg-white border border-[#5352BF] rounded-md outline-none">
                        <Select.Viewport className="text-base text-[#5352BF]">
                          <Select.Item value={dealStatus[0]} className="px-3 py-2 outline-none rounded-md hover:bg-violet-50">
                          <Select.ItemText>{dealStatus[0]}</Select.ItemText>
                          </Select.Item>
                          <Select.Item value={dealStatus[1]} className="px-3 py-2 outline-none rounded-md hover:bg-violet-50">
                            <Select.ItemText>{dealStatus[1]}</Select.ItemText>
                          </Select.Item>
                          <Select.Item value={dealStatus[2]} className="px-3 py-2 outline-none rounded-md hover:bg-violet-50">
                          <Select.ItemText>{dealStatus[2]}</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                        <Select.Arrow />
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <div className="flex flex-col">
                  {dealsMock.map(deal => {
                    return (
                      <DealItem deal={deal} key={deal.id}/>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
