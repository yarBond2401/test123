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
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        display: false,
      },
      x: {
        ticks: {
          font: {
            size: 6,
          }
        },
        grid: {
          display: false, 
        },
      },
    },
  }

  const optionsLine = {
    maintainAspectRatio: false,
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
          <div className="flex flex-col md:gap-6 gap-4 w-full">
            <div className="grid grid-cols-1 md:gap-6 gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
              <div className="flex bg-white border border-[#DFE4EA] rounded-10 flex-col md:flex-row lg:flex-col md:col-span-2 lg:col-span-1 justify-between">
                <div className="flex xl:flex-row lg:flex-col gap-[15px] items-center xl:p-22 p-4">
                  <Image
                    src={user?.photoURL || defaultAvatar}
                    width={80}
                    height={80}
                    alt="User profile picture"
                    className="h-20 w-20 rounded-[5px] object-cover border border-[#DFE4EA]"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-dashboard-main 2xl:text-xl leading-[22px] font-medium lg:text-base md:text-xl">
                      John Strassmann
                    </p>
                    <p className="text-dashboard-secondary 2xl:text-base leading-[22px] font-medium lg:text-sm md:text-base">
                      Vendor
                    </p>
                  </div>
                </div>

                <Separator className="md:hidden lg:block"/>
                <div className="xl:p-22 p-4 flex flex-col xl:gap-5 w-full md:w-1/2 lg:w-full gap-2">
                  <div className="flex flex-row justify-between w-full gap-1">
                    <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                      My Level
                    </p>
                    <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm text-end md:text-base">
                      New Seller
                    </p>
                  </div>
                  <div className="flex flex-row justify-between w-full gap-1">
                    <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                      Success score
                    </p>
                    <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                      100%
                    </p>
                  </div>
                  <div className="flex flex-row justify-between w-full gap-1">
                    <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                      Rating
                    </p>
                    <div className="flex flex-row gap-1">
                      <Image src={iconStar} alt="star" height={16} width={16} />
                      <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                        5
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row justify-between w-full gap-1">
                    <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                      Response rate
                    </p>
                    <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                      80
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:gap-6 gap-4 grid-cols-3 w-full lg:col-span-3 md:col-span-2">
                <div className="flex flex-row md:gap-6 gap-4 col-span-3 w-full md:flex-nowrap flex-wrap">
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

                <div className="grid md:gap-6 gap-4 grid-cols-3 w-full col-span-3">
                  <div className="flex xl:flex-row flex-col xl:px-22 px-4 xl:py-7 py-5 bg-white border border-[#DFE4EA] rounded-10 xl:items-center gap-5 justify-between md:col-span-1 col-span-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-dashboard-main xl:leading-[29px] leading-5 font-bold xl:text-2xl md:text-lg text-2xl">
                        $700
                      </p>
                      <p className="text-dashboard-secondary leading-[22px] font-medium 2xl:text-base md:text-sm text-base">
                        Earned in April
                      </p>
                    </div>
                    <div className="xl:w-1/2 w-full xl:h-16">
                      <Line 
                        data={{
                          labels: ["", "", "", ""],
                          datasets: [{
                            data: [0, 55, 50, 100],
                            borderColor: "#A652BF",
                            tension: 0.4,
                            pointRadius: 0,
                          }]
                        }}
                        options={optionsLine}
                      />
                    </div>
                  </div>

                  <div className="flex xl:flex-row flex-col md:col-span-2 col-span-3 xl:px-22 px-4 py-3.5 bg-white border border-[#DFE4EA] rounded-10 xl:items-center gap-5 justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-dashboard-main  xl:leading-[29px] leading-5 font-bold xl:text-2xl md:text-lg text-2xl">
                        $7.500
                      </p>
                      <p className="text-dashboard-secondary leading-[22px] font-medium 2xl:text-base md:text-sm text-base">
                        Annually Earned{" "}
                      </p>
                    </div>
                    <div className="xl:w-3/4 w-full h-[90px]">
                      <Bar 
                        data={{
                          labels: annualEarnedChartData.map(item => item.label),
                          datasets: [
                            {
                              data: annualEarnedChartData.map(item => item.value1),
                              backgroundColor: "#3758F9",
                              borderRadius: 1,
                              barPercentage: 0.5,
                            },
                            {
                              data: annualEarnedChartData.map(item => item.value2),
                              backgroundColor: "#13C296",
                              borderRadius: 1,
                              barPercentage: 0.5,
                            },
                            {
                              data: annualEarnedChartData.map(item => item.value3),
                              backgroundColor: "#F2994A",
                              borderRadius: 1,
                              barPercentage: 0.5,
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

            <div className="grid grid-cols-1 md:gap-6 gap-4 lg:grid-cols-4 w-full">
              <div className="flex flex-col bg-white border border-[#DFE4EA] rounded-10 lg:col-span-1">
                <div className="flex flex-row justify-between p-5 items-center">
                  <p className="text-dashboard-main xl:text-xl leading-6 font-medium md:text-base text-xl">
                    Inbox
                  </p>
                  <Link
                    href="/dashboard/chat"
                    className="xl:text-lg md:text-sm text-lg leading-[22px] font-medium text-[#5352BF]"
                  >
                    View all
                  </Link>
                </div>
                <Separator />
                <div className="flex lg:flex-col md:flex-row flex-col 2xl:px-5 xl:px-3 pt-5 lg:px-0 px-3">
                  {inboxItems.map((item) => {
                    return <InboxItem key={item.name} item={item} />;
                  })}
                </div>
              </div>
              <div className="flex flex-col bg-white border border-[#DFE4EA] rounded-10 lg:col-span-3">
                <div className="flex flex-row justify-between py-3 xl:px-6 lg:px-2 px-6 items-center">
                  <p className="text-dashboard-main xl:text-xl text-lg leading-6 font-medium">{selectedStatus}</p>
                  <Select.Root value={selectedStatus} onValueChange={setSelectedStatus}>
                    <Select.Trigger className="flex flex-row gap-[10px] xl:px-3 px-1 xl:py-2 py-1 border border-[#5352BF] rounded-md outline-none items-center xl:text-base text-sm text-[#5352BF] hover:bg-violet-50">
                      <Select.Value/>
                      <Select.Icon>
                        <Image src={DropdownIcon} alt="icon" height={18} width={18} />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content className="bg-white border border-[#5352BF] rounded-md outline-none">
                        <Select.Viewport className="xl:text-base text-sm text-[#5352BF]">
                          <Select.Item value={dealStatus[0]} className="xl:px-3 px-1 xl:py-2 py-1 outline-none rounded-md hover:bg-violet-50">
                          <Select.ItemText>{dealStatus[0]}</Select.ItemText>
                          </Select.Item>
                          <Select.Item value={dealStatus[1]} className="xl:px-3 px-1 xl:py-2 py-1 outline-none rounded-md hover:bg-violet-50">
                            <Select.ItemText>{dealStatus[1]}</Select.ItemText>
                          </Select.Item>
                          <Select.Item value={dealStatus[2]} className="xl:px-3 px-1 xl:py-2 py-1 outline-none rounded-md hover:bg-violet-50">
                          <Select.ItemText>{dealStatus[2]}</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                        <Select.Arrow />
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
                <div className="flex flex-col justify-between">
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
