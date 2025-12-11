export interface Party {
  id: number;
  name: string;
  address: string;
  city: string;
  mobileNo: string;
  // state: string;
  marketerId?: number;  
  marketer?: Marketer
  isActive: boolean;
}
export interface Marketer {
  id: number;
  name: string;
  number: string;
}