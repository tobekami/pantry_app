export interface PantryItem {
  id?: string;
  name: string;
  quantity: number;
  imageUrl?: string;
  userId?: string;
  expiryDate?: string;
  dateAdded?: string; // Add this line
}