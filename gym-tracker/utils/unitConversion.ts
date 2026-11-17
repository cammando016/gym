import { WeightUnit } from "@/types/user";

const KILO_TO_POUND : number = 0.45359237;

export const kgToLb = (n : number) : number => n / KILO_TO_POUND;

export const lbToKg = (n : number) : number => n * KILO_TO_POUND;

export const snapToPoint05 = (n : number) : number => Number((Math.round(n * 20) /20).toFixed(2));

export const parseToKg = (s : string, unit: WeightUnit) : number | null => {
    const num = Number(s.trim());
    if (s.trim() === '' || Number.isNaN(num) || num <= 0) return null;

    const snappedNum = snapToPoint05(num);

    const kg = unit === 'kg' ? snappedNum : lbToKg(snappedNum);
    return Number(kg.toFixed(2)) //db stores as numeric(6, 2)
}

export const toDisplay = (kg: number, unit: WeightUnit) : string => {
    return unit === 'kg' ? kg.toString() : snapToPoint05(kgToLb(kg)).toString();
}