export type BrokerType = {
  id: string;
  name: string;
  image: string;
  users: string[];
  admins: string[];
};

export type UsersV1Type = Record<
  string,
  {
    displayName: string;
    email: string;
    photoURL: string;
  }
>;
