import { TOption } from '@/types';
import { format } from 'date-fns';

export const utils = {
  findLabel: (options: TOption[], val: number | string | undefined): string => {
    return options.find((item) => item.value === val)?.label || '';
  },
  formatDollar: (amount: number | undefined, digit = 2): string => {
    if (!amount) {
      return '$0.00';
    }
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digit,
    });
  },
  formatPercent: (
    percentageValue: number | undefined | string,
    radix = 3,
  ): string => {
    if (!percentageValue) {
      if (radix === 0) {
        return '0%';
      }
      return '0.000%';
    }
    let target = percentageValue;
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (this.TypeOf(target) === 'String') {
      target = parseFloat(target as string);
    }
    return (
      ((Math.floor((target as number) * 1000000) / 1000000) * 100).toFixed(
        radix,
      ) + '%'
    );
  },
  formatLocalPercent: (
    percentageValue: number | undefined,
    radix = 2,
  ): string => {
    if (!percentageValue) {
      return '0%';
    }
    return percentageValue.toLocaleString('en-US', {
      style: 'percent',
      minimumFractionDigits: radix,
    });
  },
  formatDate: (
    date: string | Date,
    timeFormat = 'yyyy-MM-dd HH:mm:ss O',
    options?: {
      locale?: Locale;
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
      firstWeekContainsDate?: number;
      useAdditionalWeekYearTokens?: boolean;
      useAdditionalDayOfYearTokens?: boolean;
    },
  ): string => {
    return format(new Date(date), timeFormat, options);
  },
  getParamsFromUrl(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },
  TypeOf(input: unknown): string {
    return Object.prototype.toString.call(input).slice(8, -1);
  },
  notUndefined(value: unknown): boolean {
    return Object.prototype.toString.call(value).slice(8, -1) !== 'Undefined';
  },
  colorCalculator(val: string | undefined): string {
    const condition = val?.toLocaleUpperCase()[0];
    let result = '';
    switch (condition) {
      case 'A':
      case 'B':
      case 'C':
        result = '#578887';
        break;
      case 'D':
      case 'E':
      case 'F':
        result = '#d8c9af';
        break;
      case 'G':
      case 'H':
      case 'I':
        result = '#E99475';
        break;
      case 'J':
      case 'K':
      case 'L':
        result = '#91cec2';
        break;
      case 'M':
      case 'N':
      case 'O':
        result = '#b08053';
        break;
      case 'P':
      case 'Q':
      case 'R':
        result = '#fecb4d';
        break;
      case 'S':
      case 'T':
        result = '#5ebad9';
        break;
      case 'U':
      case 'V':
        result = '#4662b2';
        break;
      case 'W':
      case 'X':
        result = '#a990dd';
        break;
      case 'Y':
      case 'Z':
        result = '#ab1438';
        break;
    }
    return result;
  },
};
