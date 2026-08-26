import { Customer, CustomerBoxRecord, PriceRevision, BoxDimensions, PaperSpecs, PrintingSpecs, FinishingSpecs, ConvertingSpecs, ProductionSpecs, BoxCategory, CostBreakdown, QuantityTier } from '../types';
import { INITIAL_CUSTOMERS, INITIAL_BOX_RECORDS } from '../data/customerData';

const CUSTOMERS_KEY = 'packcalc_customers_v1';
const BOX_RECORDS_KEY = 'packcalc_box_records_v1';

export const loadStoredCustomers = (): Customer[] => {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(INITIAL_CUSTOMERS));
      return INITIAL_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load customers from storage:', e);
    return INITIAL_CUSTOMERS;
  }
};

export const saveStoredCustomers = (customers: Customer[]): void => {
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch (e) {
    console.error('Failed to save customers to storage:', e);
  }
};

export const loadStoredBoxRecords = (): CustomerBoxRecord[] => {
  try {
    const raw = localStorage.getItem(BOX_RECORDS_KEY);
    if (!raw) {
      localStorage.setItem(BOX_RECORDS_KEY, JSON.stringify(INITIAL_BOX_RECORDS));
      return INITIAL_BOX_RECORDS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load box records from storage:', e);
    return INITIAL_BOX_RECORDS;
  }
};

export const saveStoredBoxRecords = (records: CustomerBoxRecord[]): void => {
  try {
    localStorage.setItem(BOX_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save box records to storage:', e);
  }
};

export interface SaveRevisionPayload {
  customerId: string;
  customerName: string;
  boxId?: string; // If existing, or will generate new
  boxName: string;
  boxCategory: BoxCategory;
  reason: string;
  dimensions: BoxDimensions;
  paper: PaperSpecs;
  printing: PrintingSpecs;
  finishing: FinishingSpecs;
  converting: ConvertingSpecs;
  production: ProductionSpecs;
  result: CostBreakdown;
  quantityTiers: QuantityTier[];
}

export const recordNewPriceRevision = (
  payload: SaveRevisionPayload
): { updatedRecords: CustomerBoxRecord[]; newRevision: PriceRevision } => {
  const records = loadStoredBoxRecords();
  const now = Date.now();
  const formattedDate = new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Check if box record exists
  let targetRecord = records.find(
    (r) =>
      r.customerId === payload.customerId &&
      (payload.boxId ? r.id === payload.boxId : r.boxName.toLowerCase() === payload.boxName.trim().toLowerCase())
  );

  let newRevisionNo = 1;
  let priceDiffFromPrevious: number | undefined = undefined;
  let percentDiffFromPrevious: number | undefined = undefined;
  const currentPrice = payload.result.sellingPricePerUnit;

  if (targetRecord) {
    newRevisionNo = targetRecord.revisions.length + 1;
    if (targetRecord.revisions.length > 0) {
      const prevRev = targetRecord.revisions[targetRecord.revisions.length - 1];
      const prevPrice = prevRev.sellingPrice;
      priceDiffFromPrevious = Number((currentPrice - prevPrice).toFixed(2));
      percentDiffFromPrevious = Number((((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1));
    }
  }

  const generatedBoxId = targetRecord ? targetRecord.id : `box-${Date.now()}`;
  const generatedRevId = `rev-${generatedBoxId}-${newRevisionNo}-${Date.now()}`;

  const newRevision: PriceRevision = {
    id: generatedRevId,
    customerId: payload.customerId,
    customerName: payload.customerName,
    boxId: generatedBoxId,
    boxName: payload.boxName,
    boxCategory: payload.boxCategory,
    timestamp: now,
    formattedDate,
    revisionNo: newRevisionNo,
    reason: payload.reason.trim() || `ปรับปรุงราคาครั้งที่ ${newRevisionNo}`,
    dimensions: { ...payload.dimensions },
    paper: { ...payload.paper },
    printing: { ...payload.printing },
    finishing: { ...payload.finishing },
    converting: { ...payload.converting },
    production: { ...payload.production },
    result: payload.result,
    quantityTiers: payload.quantityTiers,
    unitCost: payload.result.totalCostPerUnit,
    sellingPrice: payload.result.sellingPricePerUnit,
    totalProfit: payload.result.totalProfit,
    priceDiffFromPrevious,
    percentDiffFromPrevious,
  };

  let updatedRecords: CustomerBoxRecord[];

  if (targetRecord) {
    updatedRecords = records.map((r) => {
      if (r.id === targetRecord!.id) {
        return {
          ...r,
          boxName: payload.boxName,
          boxCategory: payload.boxCategory,
          lastUpdated: now,
          currentRevisionNo: newRevisionNo,
          latestSnapshot: {
            dimensions: { ...payload.dimensions },
            paper: { ...payload.paper },
            printing: { ...payload.printing },
            finishing: { ...payload.finishing },
            converting: { ...payload.converting },
            production: { ...payload.production },
          },
          revisions: [...r.revisions, newRevision],
        };
      }
      return r;
    });
  } else {
    const newRecord: CustomerBoxRecord = {
      id: generatedBoxId,
      customerId: payload.customerId,
      boxName: payload.boxName,
      boxCategory: payload.boxCategory,
      lastUpdated: now,
      currentRevisionNo: 1,
      latestSnapshot: {
        dimensions: { ...payload.dimensions },
        paper: { ...payload.paper },
        printing: { ...payload.printing },
        finishing: { ...payload.finishing },
        converting: { ...payload.converting },
        production: { ...payload.production },
      },
      revisions: [newRevision],
    };
    updatedRecords = [newRecord, ...records];
  }

  saveStoredBoxRecords(updatedRecords);
  return { updatedRecords, newRevision };
};
