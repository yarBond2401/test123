// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";

import { useRequireLogin } from "@/hooks/useRequireLogin";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Statistics } from "@/components/dashboard/Statistics";

import defaultAvatar from "@/images/default-user-picture.jpg";
import iconStar from "@/icons/icon=star.svg";
import iconDollar from "@/icons/icon=dollar.svg";
import iconWork from "@/icons/icon=work.svg";
import iconWatch from "@/icons/icon=watch.svg";
import { annualEarnedChartData } from "@/mock/annualEarnedChartDataMock";
import { useIsVendor } from "@/hooks/useIsVendor";
import Loading from "../loading";
import useUserInfo from "@/hooks/useUserInfo";
import { capitalize } from "@/lib/utils";
import { format, subMonths } from "date-fns";
import { InboxCard } from "./Inbox";
import OffersDashboard from "./offers-dash";
import { ExtendedButton } from "@/components/ui/extended-button";
import AddPostsModal from "@/components/payment/AddPostsModal";
import useFetchChartData from "@/hooks/useFetchChartData";
import useFetchCurrentMonthData from "@/hooks/useFetchCurrentMonthData";
import useFetchTotalOffers from "@/hooks/useFetchTotalOffers";
import { elements } from "chart.js/auto";
import useFetchTotalRequests from "@/hooks/useFetchTotalRequests";
import usePushNotifications from "@/hooks/usePushNotifications";

const Dashboard = () => {
  const router = useRouter();
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  usePushNotifications(user);

  useEffect(() => {
    if (user?.email === 'info@mrkit.io') {
      router.push("dashboard/sign-installation");
    }
  }, [user, router])

  const { userInfo } = useUserInfo(user);
  const isVendor = useIsVendor(user);

  const { monthlyData, annualData, annualTotal, loading: chartsLoading } = useFetchChartData(isVendor, user?.uid);
  const { currentMonthData, loading: currentMonthLoading } = useFetchCurrentMonthData(isVendor, user?.uid);
  const { totalOffers, loading: offersLoading } = useFetchTotalOffers(isVendor, user?.uid);
  const { totalRequests, loading: requestsLoading } = useFetchTotalRequests(user?.uid);

  const currentMonth = format(new Date(), 'MMMM');
  const previousMonth = format(subMonths(new Date(), 1), 'MMMM');

  const { totalMoney, totalMoneyGrowth } = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();
    const previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

    const currentMonthData = annualData[currentMonthIndex];
    const previousMonthData = annualData[previousMonthIndex];

    const currentTotal = currentMonthData ? currentMonthData.value1 + currentMonthData.value2 + currentMonthData.value3 : 0;
    const previousTotal = previousMonthData ? previousMonthData.value1 + previousMonthData.value2 + previousMonthData.value3 : 0;

    const totalMoney = annualData.reduce((total, month) => total + month.value1 + month.value2 + month.value3, 0);

    const totalMoneyGrowth = Math.floor(previousTotal === 0
      ? (currentTotal > 0 ? 100 : 0)
      : ((previousTotal - currentTotal) / previousTotal) * 100);

    return {
      totalMoney,
      totalMoneyGrowth: isNaN(totalMoneyGrowth) ? 0 : totalMoneyGrowth
    };
  }, [annualData]);

  const totalOffersGrowth = useMemo(() => {
    const currentMonthIndex = new Date().getMonth();
    const previousMonthIndex = currentMonthIndex === 0 ? 11 : currentMonthIndex - 1;

    const currentMonthOffers = annualData[currentMonthIndex]?.offers || 0;
    const previousMonthOffers = annualData[previousMonthIndex]?.offers || 0;

    const growth = Math.floor(previousMonthOffers === 0
      ? (currentMonthOffers > 0 ? 100 : 0)
      : ((previousMonthOffers - currentMonthOffers) / previousMonthOffers) * 100);

    return isNaN(growth) ? 0 : growth;
  }, [annualData]);


  const dataForCurrentMonth = monthlyData.find(
    (item) => item.month === currentMonth
  );


  useEffect(() => {
    if (userInfo) {
      setLoadingUserInfo(false);
    }
  }, [userInfo]);

  if (!user || loadingUserInfo || chartsLoading || currentMonthLoading || offersLoading || requestsLoading) {
    return <Loading />;
  }

  const totalMoneyFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalMoney || 0);

  const totalWorkFormatted = new Intl.NumberFormat("en-US", {
    style: "decimal",
  }).format(totalOffers || 0);

  const totalHoursFormatted = new Intl.NumberFormat("en-US", {
    style: "decimal",
  }).format(totalOffers || 0);

  const monthlyAmountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dataForCurrentMonth?.value || 0);

  const annualAmountFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(annualTotal || 0);


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
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

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
  };

  const getLineChartData = () => {
    if (currentMonthLoading) {
      return [];
    }
    if (currentMonthData && currentMonthData.length > 0 && totalOffers) {
      // Using map to remove duplicates and make line smoother
      const uniqueValuesMap = new Map();
      currentMonthData.forEach(item => {
        if (!uniqueValuesMap.has(item.value)) {
          uniqueValuesMap.set(item.value, item.date);
        }
      });

      let array = Array.from(uniqueValuesMap.keys())

      if (isVendor) {
        array = array.sort((a, b) => new Date(uniqueValuesMap.get(a)).getTime() - new Date(uniqueValuesMap.get(b)).getTime());
      }

      if (array.length === 1) {
        array.push(array[0]);
      }

      return array;
    }
    // Fallback mock data
    return isVendor ? [0, 55, 50, 100] : [100, 42, 45, 0];
  };


  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <Separator />
        </CardHeader>
        {<CardContent>
          <div className="flex flex-col md:gap-6 gap-4 w-full">
            <div className="grid grid-cols-1 md:gap-6 gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
              <div className="shadow flex bg-white border border-[#DFE4EA] rounded-10 flex-col md:flex-row lg:flex-col md:col-span-2 lg:col-span-1 justify-between">
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
                      {user?.displayName || userInfo?.name || "Your name"}
                    </p>
                    <p className="text-dashboard-secondary 2xl:text-base leading-[22px] font-medium lg:text-sm md:text-base">
                      {userInfo?.role ? capitalize(userInfo?.role) : isVendor ? "Vendor" : "Agent"}
                    </p>
                  </div>
                </div>
                <Separator className="md:hidden lg:block" />
                <div className="xl:p-22 p-4 flex flex-col xl:gap-5 w-full md:w-1/2 lg:w-full gap-2">
                  {isVendor && (
                    <div className="flex flex-row justify-between w-full gap-1">
                      <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                        My Level
                      </p>
                      <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm text-end md:text-base">
                        {capitalize(userInfo?.level)}
                      </p>
                    </div>
                  )}
                  {isVendor && (
                    <div className="flex flex-row justify-between w-full gap-1">
                      <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                        Success score
                      </p>
                      <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                        {userInfo?.success + "%"}
                      </p>
                    </div>
                  )}
                  {!isVendor && (
                    <div className="flex flex-row justify-between w-full gap-1">
                      <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                        Offers
                      </p>
                      <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                        {totalOffers || 0}
                      </p>
                    </div>
                  )}
                  {!isVendor && (
                    <div className="flex flex-row justify-between w-full gap-1">
                      <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                        Requests
                      </p>
                      <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                        {totalRequests || 0}
                      </p>
                    </div>
                  )}

                  {/* {!isVendor && userInfo?.availablePosts <= 3 && (
                    <AddPostsModal userEmail={user?.email} userInfo={userInfo} userId={user?.uid} />
                  )} */}
                  {/* {!isVendor && (
                    <>
                      <div className="flex flex-row justify-between w-full gap-1">
                        <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                          Posts installed
                        </p>
                        <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                          {userInfo?.postsInstalled || userInfo?.postsInstalled}
                        </p>
                      </div>
                      <div className="flex flex-row justify-between w-full gap-1">
                        <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                          My Level
                        </p>
                        <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                          {capitalize(userInfo?.level)}
                        </p>
                      </div>
                    </>
                  )} */}
                  {userInfo?.totalRating && userInfo?.totalReviews && userInfo.totalReviews !== 0 ? (
                    <div className="flex flex-row justify-between w-full gap-1">
                      <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                        Rating
                      </p>
                      <div className="flex flex-row gap-1">
                        <Image src={iconStar} alt="star" height={16} width={16} />
                        <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                          {Math.floor(userInfo.totalRating / userInfo.totalReviews)}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {isVendor && (
                    <div className="flex flex-row justify-between w-full gap-1">
                      <p className="text-dashboard-main xl:text-base leading-[22px] lg:text-sm md:text-base">
                        Response rate
                      </p>
                      <p className="text-dashboard-main xl:text-base leading-[22px] font-bold lg:text-sm md:text-base">
                        {userInfo?.response}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:gap-6 gap-4 grid-cols-3 w-full lg:col-span-3 md:col-span-2">
                <div className="flex flex-row md:gap-6 gap-4 col-span-3 w-full md:flex-nowrap flex-wrap">
                  <Statistics
                    icon={iconDollar}
                    result={totalMoneyFormatted}
                    total={isVendor ? "Earnings" : "Spent"}
                    grow={totalMoneyGrowth}
                  />
                  <Statistics
                    icon={iconWork}
                    result={totalWorkFormatted}
                    total={isVendor ? "Jobs" : "Hires"}
                    grow={totalOffersGrowth}
                  />
                  <Statistics
                    icon={iconWatch}
                    result={totalHoursFormatted}
                    total="Hours"
                    grow={totalOffersGrowth}
                  />
                </div>

                <div className="grid md:gap-6 gap-4 grid-cols-3 w-full col-span-3">
                  <div className="flex xl:flex-row flex-col xl:px-22 px-4 xl:py-7 py-5 shadow bg-white border border-[#DFE4EA] rounded-10 xl:items-center gap-5 justify-between md:col-span-1 col-span-3">
                    <div className="flex flex-col gap-2">
                      <p className="text-dashboard-main xl:leading-[29px] leading-5 font-bold xl:text-2xl md:text-lg text-2xl">
                        {monthlyAmountFormatted}
                      </p>
                      <p className="text-dashboard-secondary leading-[22px] font-medium 2xl:text-base md:text-sm text-base">
                        {isVendor
                          ? `Earned in ${format(new Date(), 'MMMM')}`
                          : `Spent in ${format(new Date(), 'MMMM')}`}
                      </p>
                    </div>
                    <div className="xl:w-1/2 w-full xl:h-16">
                      <Line
                        data={{
                          labels: totalOffers ? getLineChartData().map((_) => "") : ["", "", "", ""],
                          datasets: [
                            {
                              data: getLineChartData(),
                              borderColor:
                                isVendor
                                  ? "#A652BF"
                                  : "#54BF52",
                              tension: 0.4,
                              pointRadius: 0,
                            },
                          ],
                        }}
                        options={optionsLine}
                      />
                    </div>
                  </div>

                  <div className="flex shadow xl:flex-row flex-col md:col-span-2 col-span-3 xl:px-22 px-4 py-3.5 bg-white border border-[#DFE4EA] rounded-10 xl:items-center gap-5 justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-dashboard-main  xl:leading-[29px] leading-5 font-bold xl:text-2xl md:text-lg text-2xl">
                        {annualAmountFormatted}
                      </p>
                      <p className="text-dashboard-secondary leading-[22px] font-medium 2xl:text-base md:text-sm text-base">
                        {isVendor
                          ? "Annually Earned"
                          : "Annual costs"}
                      </p>
                    </div>
                    <div className="xl:w-3/4 w-full h-[90px]">
                      <Bar
                        data={{
                          labels: (totalOffers ? annualData : annualEarnedChartData).map(
                            (item) => item.label
                          ),
                          datasets: [
                            {
                              data: (totalOffers ? annualData : annualEarnedChartData).map(
                                (item) => item.value1
                              ),
                              backgroundColor: "#3758F9",
                              borderRadius: 1,
                              barPercentage: 0.5,
                            },
                            {
                              data: (totalOffers ? annualData : annualEarnedChartData).map(
                                (item) => item.value2
                              ),
                              backgroundColor: "#13C296",
                              borderRadius: 1,
                              barPercentage: 0.5,
                            },
                            {
                              data: (totalOffers ? annualData : annualEarnedChartData).map(
                                (item) => item.value3
                              ),
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
              <InboxCard user={user} />
              <OffersDashboard />
            </div>
          </div>
        </CardContent>}
      </Card>
    </div >
  );
};

export default Dashboard;
