import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';
import { MRT_ColumnDef } from 'material-react-table';

import {
  AUTO_HIDE_DURATION,
  REPAYMENT_STATUS_OPTIONS,
  TRADE_STATUS_BGCOLOR_PALETTE,
  TRADE_STATUS_OPTIONS,
} from '@/constant';

import { ellipsisStyle } from '@/styles';
import { utils } from '@/utils';
import { useSwitch } from '@/hooks';

import {
  allLoansStatusBgcolor,
  allLoansStatusColor,
} from '@/styles/allLoansGridStyles';
import {
  GridTradeConfirmEnum,
  GridTradeStatusEnum,
} from '@/types/pipeline/youland';

import {
  StyledButton,
  StyledDatePicker,
  StyledDialog,
} from '@/components/atoms';
import { GridDropDown, GridDropDownButton } from '@/components/molecules';
import { _updateTableData } from '@/request';
import { HttpError } from '@/types/common';

export const YOULAND_COLUMNS = (
  cb?: () => Promise<void>,
  investorOptions?: Array<Option & { bgColor: string }>,
) => {
  return [
    {
      header: 'Status',
      accessorKey: 'repaymentStatus',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 140,
      minSize: 140,
      Cell: ({ renderedCellValue, row }) => {
        return (
          <GridDropDown
            bgPalette={allLoansStatusBgcolor}
            cb={cb}
            colorPalette={allLoansStatusColor}
            loanId={row.original.loanId}
            options={REPAYMENT_STATUS_OPTIONS}
            paramsKey={'repaymentStatus'}
            status={renderedCellValue ? (renderedCellValue as string) : '-'}
            tableData={row.original}
          />
        );
      },
    },
    {
      header: 'Submit date',
      accessorKey: 'submitDate',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 120,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {utils.formatDate(renderedCellValue as string)}
          </Typography>
        );
      },
    },
    {
      header: 'Property address',
      accessorKey: 'propertyAddress',
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'left' },
      size: 300,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {renderedCellValue ? renderedCellValue : '-'}
          </Typography>
        );
      },
    },
    {
      header: 'Est sale date',
      accessorKey: 'estSaleDate',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 140,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {utils.formatDate(renderedCellValue as string)}
          </Typography>
        );
      },
    },
    {
      header: 'Investor',
      accessorKey: 'investor',
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'left' },
      size: 146,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {renderedCellValue ? renderedCellValue : '-'}
          </Typography>
        );
      },
    },
    {
      header: 'Prospective buyer',
      accessorKey: 'prospectiveBuyer',
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      size: 146,
      Cell: ({ renderedCellValue, row }) => {
        return (
          <GridDropDownButton
            cb={cb}
            loanId={row.original.loanId}
            options={investorOptions}
            paramsKey={'prospectiveBuyer'}
            status={renderedCellValue as string | null}
          />
        );
      },
    },
    {
      header: 'Trade status',
      accessorKey: 'tradeStatus',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 160,
      minSize: 160,
      Cell: ({ renderedCellValue, row }) => {
        return (
          <GridDropDown
            bgPalette={TRADE_STATUS_BGCOLOR_PALETTE}
            cb={cb}
            loanId={row.original.loanId}
            options={TRADE_STATUS_OPTIONS}
            paramsKey={'tradeStatus'}
            status={renderedCellValue ? (renderedCellValue as string) : '-'}
          />
        );
      },
    },
    {
      header: 'Interest rate',
      accessorKey: 'interestRate',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 120,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {utils.formatPercent(renderedCellValue as number, 2)}
          </Typography>
        );
      },
    },
    {
      header: 'Loan amount',
      accessorKey: 'totalLoanAmount',
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'left' },
      size: 116,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {utils.formatDollar(renderedCellValue as number)}
          </Typography>
        );
      },
    },
    {
      header: 'Buy rate',
      accessorKey: 'buyRate',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 160,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {utils.formatPercent(renderedCellValue as number, 2)}
          </Typography>
        );
      },
    },
    {
      header: 'Originator spread',
      accessorKey: 'originatorSpread',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 200,
      Cell: ({ renderedCellValue }) => {
        return (
          <Typography
            sx={{
              ...ellipsisStyle,
              width: '100%',
            }}
            variant={'body3'}
          >
            {utils.formatPercent(renderedCellValue as number, 2)}
          </Typography>
        );
      },
    },
    {
      header: '',
      accessorKey: 'tradeConfirm',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 200,
      grow: true,
      Cell: ({ renderedCellValue, row }) => {
        const { enqueueSnackbar } = useSnackbar();
        const { visible, close, open } = useSwitch(false);
        const [date, setDate] = useState<Date | null>(null);
        const [updating, setUpdating] = useState(false);

        return (
          <>
            <Button
              color={'primary'}
              disabled={
                !row.original.prospectiveBuyer ||
                renderedCellValue === GridTradeConfirmEnum.completed ||
                row.original.tradeStatus !== GridTradeStatusEnum.confirmed
              }
              onClick={open}
              sx={{
                fontSize: 12,
                width: 120,
                height: 26,
                p: '0 !important',
                textTransform: 'none',
                boxShadow: 'none',
              }}
              variant={'contained'}
            >
              Complete trade
            </Button>
            <StyledDialog
              aria-hidden="true"
              content={
                <Stack gap={3} py={3}>
                  <Typography color={'text.secondary'} variant={'body2'}>
                    Please confirm the sale date below is correct before you
                    mark the trade as completed.
                  </Typography>
                  <StyledDatePicker
                    disableFuture
                    label={'Sale date'}
                    maxDate={new Date()}
                    onChange={(value) => {
                      setDate(value);
                    }}
                    value={date}
                  />
                </Stack>
              }
              footer={
                <Stack flexDirection={'row'} gap={1.5}>
                  <StyledButton
                    color={'info'}
                    onClick={() => {
                      close();
                    }}
                    size={'small'}
                    sx={{
                      width: 82,
                    }}
                    variant={'outlined'}
                  >
                    Cancel
                  </StyledButton>
                  <StyledButton
                    disabled={!date || updating}
                    loading={updating}
                    onClick={async () => {
                      if (!date) {
                        return;
                      }
                      const postData = {
                        loanId: row.original.loanId,
                        saleDate: format(date, 'yyyy-MM-dd'),
                        tradeConfirm: GridTradeConfirmEnum.completed,
                      };
                      setUpdating(true);
                      try {
                        await _updateTableData(postData);
                        await cb?.();
                      } catch (err) {
                        const { header, message, variant } = err as HttpError;
                        enqueueSnackbar(message, {
                          variant: variant || 'error',
                          autoHideDuration: AUTO_HIDE_DURATION,
                          isSimple: !header,
                          header,
                        });
                      } finally {
                        setUpdating(false);
                        close();
                      }
                    }}
                    size={'small'}
                    sx={{
                      width: 82,
                    }}
                  >
                    Confirm
                  </StyledButton>
                </Stack>
              }
              header={'Confirm sale date'}
              open={visible}
            />
          </>
        );
      },
    },
  ] as MRT_ColumnDef<any>[];
};