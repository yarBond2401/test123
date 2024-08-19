"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import {
  MdKey,
  MdSpaceDashboard,
  MdPerson,
  MdHomeRepairService,
  MdEditDocument,
  MdChat,
  MdLocalOffer,
  MdListAlt,
} from "react-icons/md";
import dynamic from "next/dynamic";
import { mutate } from "swr";

import { auth } from "@/app/firebase";
import DashboardLink from "@/components/DashboardLink";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import defaultAvatar from "@/images/default-user-picture.jpg";
import logo from "@/images/logo-white-bg.png";
import { cn } from "@/lib/utils";
import { useIsVendor } from "@/hooks/useIsVendor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoadingMessagesPopover } from "@/components/LoadingMessagesPopover";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { BrokerType } from "../firestoreTypes";
import useOnlineStatus from "@/hooks/useOnlineStatus";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";
import NotificationsList from "@/components/NotificationsList";

const DynamicMessagesBadge = dynamic(() => import("@/components/MessagesPopover").then(module => module.MessagesPopover), {
  ssr: false,
  loading: () => <LoadingMessagesPopover />,
});


interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();

  const [sideBarOpen, setSideBarOpen] = useState(false);

  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  const [loading, setLoading] = useState(true);
  const isVendor = useIsVendor(user, setLoading);

  const online = useOnlineStatus(user, isVendor, loading);

  const { data: brokerData } = useFirestoreQuery<BrokerType[]>(
    "brokers",
    "users",
    "array-contains",
    user?.uid
  );
  const broker: BrokerType | undefined = brokerData?.[0];

  const handleLogout = async () => {
    mutate((_) => true, undefined, { revalidate: false });
    await signOut(auth);
  };

  return (
    <>
      <aside
        onClick={() => setSideBarOpen(false)}
        className={cn(
          sideBarOpen ? "" : "ml-[-100%]",
          "fixed top-0 z-[1000] flex h-screen w-full flex-col justify-between border-r bg-ptertiary px-6 pb-3 transition-margin duration-300 md:w-4/12 lg:ml-0 lg:w-[25%] xl:w-[20%] 2xl:w-[15%] dark:bg-gray-800 dark:border-gray-700"
        )}
      >
        <div>
          <div className="px-6 py-4">
            <Link href="/dashboard">
              <Image src={logo} alt="tailus logo" className="w-24" />
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Image
              src={user?.photoURL || defaultAvatar}
              width={100}
              height={100}
              alt="User profile picture"
              className="m-auto h-10 w-10 rounded-full object-cover lg:h-28 lg:w-28 border-2 border-pprimary dark:border-sky-400"
            />
            <h5 className="mt-4 hidden text-xl font-semibold text-secondary lg:block dark:text-gray-300">
              {user?.displayName || ""}
            </h5>
            <span className="hidden text-gray-300 lg:block">
              {user?.email === 'info@mrkit.io' && 'Sign Installation Vendor'}
              {user?.email !== 'info@mrkit.io' ? isVendor ? "Vendor" : "Agent" : ''}
            </span>
          </div>

          <ul className="mt-8 space-y-2 tracking-wide">
            {user?.email !== 'info@mrkit.io' && <DashboardLink
              link="/dashboard"
              text="Dashboard"
              icon={<MdSpaceDashboard />}
            />}
            {!isVendor && broker && ( // TODO: It can be improved if only subscription is active
              <DashboardLink
                link="/dashboard/requests"
                text="Requests"
                icon={<MdEditDocument />}
              />
            )}
            {!isVendor && broker && (
              <DashboardLink
                link="/dashboard/offers"
                text="My offers"
                icon={<MdListAlt />}
              />
            )}
            {!isVendor && user?.email !== 'info@mrkit.io' && (
              <DashboardLink
                link="/dashboard/broker"
                text="Broker"
                icon={<MdKey />}
              />
            )}
            {isVendor && user?.email === 'info@mrkit.io' && (
              <DashboardLink
                link="/dashboard/sign-installation"
                text="Sign Installation Request"
                icon={<MdHomeRepairService />}
              />
            )}

            {isVendor && user?.email !== 'info@mrkit.io' && (
              <DashboardLink
                link="/dashboard/services"
                text="My services"
                icon={<MdHomeRepairService />}
              />
            )}
            {user?.email !== 'info@mrkit.io' && <DashboardLink
              link="/dashboard/profile"
              text="Profile"
              icon={<MdPerson />}
            />}
            {isVendor && user?.email !== 'info@mrkit.io' && (
              <DashboardLink
                link="/dashboard/deals"
                text="My deals"
                icon={<MdLocalOffer />}
              />
            )}
            <DashboardLink
              link="/dashboard/chat"
              text="Chat"
              icon={<MdChat />}
            />
          </ul>
        </div>
        <div
          className="-mx-6 flex items-center justify-between border-t px-6 pt-4 border-secondary dark:border-gray-700"
          onClick={handleLogout}
        >
          <button className="group flex items-center space-x-4 rounded-md px-4 py-3 text-primary-foreground dark:text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="group-hover:text-gray-700 dark:group-hover:text-white">
              Logout
            </span>
          </button>
        </div>
      </aside>
      <div className="ml-auto mb-6 lg:w-[75%] xl:w-[80%] 2xl:w-[85%] bg-psecondary">
        <div className="sticky top-0 h-16 border-b bg-psecondary dark:bg-gray-800 dark:border-gray-700 lg:py-2.5">
          <div className="flex items-center justify-between space-x-4 px-6 2xl:container">
            <h5
              hidden
              className="text-2xl font-medium text-gray-600 lg:block dark:text-white"
            >
              {/* {capitalize(pahtname)} */}
            </h5>
            <button
              className="-mr-2 h-16 w-12 border-r lg:hidden dark:border-gray-700 dark:text-gray-300"
              onClick={() => setSideBarOpen(!sideBarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="my-auto h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex space-x-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-xl border bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800 p-2"
                  >
                    <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end">
                  <Suspense>
                    <NotificationsList userId={user?.uid} />
                  </Suspense>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="h-10 w-10 rounded-xl border bg-gray-100 active:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:active:bg-gray-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="m-auto h-5 w-5 text-gray-600 dark:text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end">
                  {
                    user?.uid &&
                    <Suspense>
                      <DynamicMessagesBadge user={user} />
                    </Suspense>
                  }
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="group px-5 pt-6 2xl:container">{children}</div>
      </div>
    </>
  );
};

export default Layout;
