export interface OpeningStock {
  id: number;
  itemId: number;
  sizeId: number;
  gradeId: number;
  qtyType: 'Box' | 'SqMt';
  boxes?: number;
  sqmt?: number;

  // Joined fields for display
  itemName?: string;
  sizeName?: string;
  gradeName?: string;
}
