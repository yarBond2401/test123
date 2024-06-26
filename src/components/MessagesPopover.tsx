"use client"

import { collection, getDocs, limit, query, where, orderBy } from 'firebase/firestore';
import useSWR from 'swr';

import { db } from '@/app/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirestoreFunction } from '@/hooks/useFirestoreFunction';
import { User } from 'firebase/auth';
import { useIsVendor } from '@/hooks/useIsVendor';
import Link from 'next/link';
import { LoadingMessagesPopover } from './LoadingMessagesPopover';
import defaultAvatar from "@/images/default-user-picture.jpg";
import { Avatar } from './ui/avatar';
import Image from 'next/image';

import DEFAULT_USER_IMAGE from "@/images/default-user-picture.jpg";

interface Props {
  user: User
}

const firestoreFetch = (args: [string, boolean]) => new Promise(async (resolve, reject) => {
  const [uid, isVendor] = args
  console.log("arguments: ", uid, isVendor)
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'chats'), where(isVendor ? "vendor" : "agent", '==', uid), orderBy("last_time", "desc"), limit(5)
      )
    )
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log("data: ", data)
    resolve(data)
  } catch (error) {
    reject(error)
  }
})

export const MessagesPopover: React.FC<Props> = ({ user }) => {
  const isVendor = useIsVendor(user);
  // @ts-ignore
  const { data } = useSWR<any[]>([user.uid, isVendor], firestoreFetch)
  // const data = wrapPromise(firestoreFetch([user.uid, isVendor])).read()
  const otherRole = isVendor ? "agent" : "vendor"
  const { data: usersData } = useFirestoreFunction({
    name: "get_users_info_v1",
    payload: data?.length ? {
      "uids": data.map((item) =>
        item[otherRole]
      )
    } : null
  })

  return (
    <div className="flex flex-col">
      {
        data && usersData ?
          data.map((item) => {
            return <Link
              href={`/dashboard/chat/${item.id}`}
              key={item.id} className="flex items-center w-full mb-2 gap-4"
            >
              {
                usersData ?
                  // eslint-disable-next-line @next/next/no-img-element
                  <Image
                    // @ts-ignore
                    src={usersData[item[otherRole]]?.photoURL || DEFAULT_USER_IMAGE}
                    alt="user"
                    className="w-10 h-10 rounded-full"
                    width={40}
                    height={40}
                  />
                  : <Skeleton className="w-10 h-10 rounded-full flex-none" />

              }
              <div className="flex flex-col w-full">
                {
                  usersData ?
                    <h3 className="font-semibold">
                      {
                        // @ts-ignore
                        usersData[item[otherRole]].displayName
                      }
                    </h3>
                    : <Skeleton className="h-4 w-2/3" />
                }
                <p>
                  {(item.last_text as string).length > 50 ? (item.last_text as string).substring(0, 50) + '...' : item.last_text}
                </p>
              </div>
            </Link>
          }) :
          <LoadingMessagesPopover />
      }
      <Link href="/dashboard/chat" className="self-center text-sm text-blue-500">
        See all chats
      </Link>
    </div>
  )
}