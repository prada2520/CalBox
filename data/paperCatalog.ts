import { PricingUnit } from '../types';

export interface PaperMaterialOption {
  id: string;
  name: string;
  category: 'duplex_board' | 'art_card' | 'kraft_board' | 'special_card';
  categoryLabel: string;
  gsmList: number[];
  defaultGsm: number;
  pricingUnit: PricingUnit;
  defaultPricePerUnit: number;
  typicalUse: string;
}

export const PAPER_CATALOG: PaperMaterialOption[] = [
  {
    id: 'duplex_white_back',
    name: 'กล่องแป้งหลังขาว (Duplex Board White Back)',
    category: 'duplex_board',
    categoryLabel: 'กระดาษกล่องแป้งยอดนิยม',
    gsmList: [300, 350, 400, 450],
    defaultGsm: 350,
    pricingUnit: 'per_kg',
    defaultPricePerUnit: 32.0,
    typicalUse: 'ด้านในขาวสะอาด นิยมใช้กับกล่องยาสีฟัน กล่องยา กล่องขนม กล่องอาหารเสริม กล่องสินค้าทั่วไป',
  },
  {
    id: 'duplex_grey_back',
    name: 'กล่องแป้งหลังเทา (Duplex Board Grey Back)',
    category: 'duplex_board',
    categoryLabel: 'กระดาษกล่องแป้งยอดนิยม',
    gsmList: [270, 300, 350, 400, 450, 500],
    defaultGsm: 350,
    pricingUnit: 'per_kg',
    defaultPricePerUnit: 28.0,
    typicalUse: 'ประหยัดต้นทุนสูงสุด ด้านในสีเทา นิยมใช้กับกล่องสบู่ กล่องอะไหล่ กล่องหลอดไฟ กล่องรองเท้า กล่องของเล่น',
  },
  {
    id: 'artcard_c1s',
    name: 'กระดาษอาร์ตการ์ด 1 หน้า (Art Card C1S / Ivory Board)',
    category: 'art_card',
    categoryLabel: 'กระดาษการ์ดพรีเมียม',
    gsmList: [250, 300, 350, 400],
    defaultGsm: 350,
    pricingUnit: 'per_kg',
    defaultPricePerUnit: 38.0,
    typicalUse: 'ผิวกระดาษขาวเนียนพิเศษ พิมพ์งานคมชัด สีสันสดใส นิยมใช้กับกล่องเครื่องสำอาง สกินแคร์ ครีม เซรั่ม',
  },
  {
    id: 'artcard_c2s',
    name: 'กระดาษอาร์ตการ์ด 2 หน้า (Art Card C2S)',
    category: 'art_card',
    categoryLabel: 'กระดาษการ์ดพรีเมียม',
    gsmList: [250, 300, 350, 400],
    defaultGsm: 350,
    pricingUnit: 'per_kg',
    defaultPricePerUnit: 40.0,
    typicalUse: 'เคลือบผิวเรียบเนียนทั้งสองด้าน เหมาะสำหรับกล่องที่ต้องการพิมพ์ลวดลายด้านในกล่องด้วย',
  },
  {
    id: 'kraft_folding',
    name: 'กระดาษคราฟท์ฟู้ดเกรด / คราฟท์น้ำตาล (Folding Kraft)',
    category: 'kraft_board',
    categoryLabel: 'กระดาษคราฟท์ธรรมชาติ',
    gsmList: [250, 280, 300, 350],
    defaultGsm: 300,
    pricingUnit: 'per_kg',
    defaultPricePerUnit: 36.0,
    typicalUse: 'กล่องอาหาร ขนม เบเกอรี่ คุกกี้ หรือสินค้าสไตล์มินิมอล รักษ์โลก (Eco-friendly)',
  },
  {
    id: 'metallized_silver',
    name: 'กระดาษการ์ดฟอยล์เงินเมทัลลิก (Metallized Silver Board)',
    category: 'special_card',
    categoryLabel: 'กระดาษการ์ดพรีเมียม',
    gsmList: [320, 350, 400],
    defaultGsm: 350,
    pricingUnit: 'per_kg',
    defaultPricePerUnit: 58.0,
    typicalUse: 'ผิวมันวาวสะท้อนแสง เมทัลลิกหรูหรา สำหรับกล่องน้ำหอม กล่องเครื่องสำอางระดับไฮเอนด์',
  },
];
