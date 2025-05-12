export interface CertificateInterface {
  _id: string,
  created_at: Date,
  updated_at: Date,
  redeemed_at: Date | null,

  isRedeemed: boolean,
  user: string | null;
  
  code: string,
  
  issuedTo: string,
  downloadLink: string,
  position: string,
}

export interface CertificateForCreate {
  redeemed_at: Date | null,

  isRedeemed: boolean,
  userId: string | null;
  
  issuedTo: string,
  downloadLink: string,
  position: string,
}