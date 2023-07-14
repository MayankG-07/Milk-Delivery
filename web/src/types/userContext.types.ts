export type fetchNewUserDetailsProps = {
  logout?: boolean;
  userid?: number;
};

export type tokenDataTypes = {
  access_token: string;
  token_type: string;
};

export type verifyTokenDataProps = {
  token_data?: tokenDataTypes;
};

export type detailsTypes = {
  userid: number;
  name: string;
  email: string;
  phone: string;
  imgUrl?: string | null;
  houseids: number[];
  verified: boolean;
  token_data?: tokenDataTypes | null;
} | null;
