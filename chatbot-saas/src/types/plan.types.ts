export interface Plan {
  id: string;
  name: string;
  price: number;
  messagesLimit: number;
  features: string[];
  isPopular?: boolean;
}