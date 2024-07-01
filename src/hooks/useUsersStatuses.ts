import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebase';

export const subscribeUserStatus = (uids: Array<string>, isVendor: boolean, setUserStatuses: any) => {
  const collectionName = !isVendor ? 'vendors' : 'userInfo';
  const usersQuery = query(collection(db, collectionName), where('__name__', 'in', uids));

  const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
    const userDetailsData = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        online: data.hasOwnProperty('online') ? data.online : false,
      };
    });

    setUserStatuses(userDetailsData);
  });

  return unsubscribe;
};