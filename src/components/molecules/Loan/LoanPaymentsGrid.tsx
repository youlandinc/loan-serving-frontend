import { CSSProperties, FC, useCallback, useState } from 'react';
import { Drawer, Icon, Stack, Tooltip, Typography } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import {
  MRT_ColumnDef,
  MRT_TableContainer,
  useMaterialReactTable,
} from 'material-react-table';
import { useAsync } from 'react-use';
import { useSnackbar } from 'notistack';
import { format, isValid } from 'date-fns';

import { utils } from '@/utils';
import { AUTO_HIDE_DURATION, PAYMENT_METHODS_OPTIONS } from '@/constant';
import { ellipsisStyle } from '@/styles';

import {
  StyledButton,
  StyledCheckbox,
  StyledDatePicker,
  StyledDialog,
  StyledSelect,
  StyledTextFieldInput,
  StyledTextFieldNumber,
} from '@/components/atoms';

import { GridActions, LoanPaymentsGridFooter } from '@/components/molecules';

import { HttpError } from '@/types/common';
import {
  _deletePaymentData,
  _fetchCurrentBill,
  _fetchPaymentsHistory,
  _updateOrCreatePaymentData,
} from '@/request/loan/payments';
import {
  AbutmentSources,
  PaymentHistoryItem,
  PaymentMethod,
} from '@/types/loan/payments';
import { LoanAnswerEnum } from '@/types/enum';
import { useSwitch } from '@/hooks';

//import TABLE_NO_RESULT from '@/svg/loan/table-no-result.svg';
import LOGO_CLOSE from '@/svg/loan/payments/logo-close.svg';
import LOGO_EDIT from '@/svg/loan/payments/logo-edit.svg';
import LOGO_DELETE from '@/svg/portfolio/logo-delete.svg';
import {
  LoanTimelineStatusEnum,
  OverviewRepaymentTimeLine,
} from '@/types/loan/overview';

export const LoanPaymentsGrid: FC<{
  maxHeight?: CSSProperties['maxHeight'];
  cb?: () => Promise<void>;
}> = ({ maxHeight, cb }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [fetchLoading, setFetchLoading] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const [editLoading, setEditLoading] = useState(false);

  const [formData, setFormData] = useState<{
    id: string | number | undefined;
    dataReceivedTime: string | null | Date;
    dateDue: string;
    paymentMethod: PaymentMethod | undefined;
    totalPmt: number | undefined;
    nsf: LoanAnswerEnum;
  }>({
    dataReceivedTime: null,
    dateDue: '',
    paymentMethod: PaymentMethod.ach,
    totalPmt: undefined,
    nsf: LoanAnswerEnum.no,
    id: undefined,
  });

  const { open, close, visible } = useSwitch(false);

  const { loading } = useAsync(async () => {
    await fetchData(0, 50);
  }, []);

  const [dateDue, setDateDue] = useState('');

  useAsync(async () => {
    const { loanId } = utils.getParamsFromUrl(location.href);
    if (!loanId) {
      return;
    }
    try {
      const { data } = await _fetchCurrentBill({ loanId });
      const handler = (arr: OverviewRepaymentTimeLine[]) => {
        const index = arr.findIndex(
          (item) =>
            ![
              LoanTimelineStatusEnum.paid,
              LoanTimelineStatusEnum.paid_late,
            ].includes(item.billStatus),
        );

        return index === -1
          ? format(
              new Date(arr[arr.length - 1].dateDue as string),
              'MM/dd/yyyy',
            )
          : format(new Date(arr[index].dateDue as string), 'MM/dd/yyyy');
      };
      setDateDue(handler(data));
    } catch (err) {
      const { header, message, variant } = err as HttpError;
      enqueueSnackbar(message, {
        variant: variant || 'error',
        autoHideDuration: AUTO_HIDE_DURATION,
        isSimple: !header,
        header,
      });
    }
  }, []);

  const fetchData = async (page: number, size: number) => {
    const { loanId } = utils.getParamsFromUrl(location.href);
    if (!loanId) {
      return;
    }
    const postData = {
      loanId,
      page,
      size,
    };
    setFetchLoading(true);
    try {
      const { data } = await _fetchPaymentsHistory(postData);

      const last = {
        dataReceivedTime: `Total (${data.totalItem} row${
          data.totalItem > 1 ? 's' : ''
        })`,
        totalPmt: data.accumulateTotalPmt,
        totalInterestReceived: data.accumulateTotalInterestReceived,
        //defaultInterestReceived: data.accumulateDefaultInterestReceived,
        //interestRateReceived: data.accumulateInterestRateReceived,
        principalReceived: data.accumulatePrincipalReceived,
        accruedLateCharges: data.accumulateAccruedLateCharges,
        waivedLateCharges: data.accumulateWaivedLateCharges,
        reservePmt: data.accumulateReservePmt,
        reserveRestricted: data.accumulateReserveRestricted,
        id: '-1',
      };
      setIsEditable(
        [AbutmentSources.alameda, AbutmentSources.youland].includes(
          data.abutmentSources,
        ),
      );
      const list = data?.content || [];
      if (list.length > 0) {
        list.push(last);
        setList(list);
        table.setRowSelection({ '-1': true });
        table.setRowPinning({ bottom: ['-1'] });
      }
      setPage({
        number: data.page.number + 1,
        size: data.page.size,
        totalElements: data.page.totalElements,
        totalPages: data.page.totalPages,
      });
    } catch (err) {
      const { header, message, variant } = err as HttpError;
      enqueueSnackbar(message, {
        variant: variant || 'error',
        autoHideDuration: AUTO_HIDE_DURATION,
        isSimple: !header,
        header,
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const [list, setList] = useState<Array<Partial<PaymentHistoryItem>>>([]);
  const [page, setPage] = useState({
    number: 1,
    size: 50,
    totalElements: 5,
    totalPages: 1,
  });

  const onPageSizeChange = async (pageSize: number) => {
    setPage((prev) => ({ ...prev, size: pageSize }));
    await fetchData(page.number - 1, pageSize);
  };

  const onPageChange = async (currentPage: number) => {
    setPage((prev) => ({ ...prev, number: currentPage }));
    await fetchData(currentPage - 1, page.size);
  };

  const table = useMaterialReactTable({
    columns: LOAN_PAYMENT_GRID_COLUMNS(open, setFormData, fetchData, cb),
    data: list,
    //rowCount: rowsTotal,
    enableExpandAll: false, //hide expand all double arrow in column header
    enableExpanding: false,
    enableSorting: false,
    enableBottomToolbar: false, //pipelineType === PipelineDisplayMode.LIST_MODE,
    paginateExpandedRows: true, //When rows are expanded, do not count sub-rows as number of rows on the page towards pagination
    enableTopToolbar: false,
    enableGrouping: false,

    enableRowVirtualization: true,

    enableColumnActions: false, //pipelineType === PipelineDisplayMode.LIST_MODE,
    enableColumnOrdering: false,
    enableColumnDragging: false,
    enableColumnResizing: false,
    enableColumnVirtualization: true,

    enableRowPinning: true,
    rowPinningDisplayMode: 'select-bottom',

    manualPagination: true,
    state: {
      showSkeletons: fetchLoading || loading,
    },
    initialState: {
      showProgressBars: false,
    },
    getRowId: (row) => row.id, //default
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 5 }, //optionally customize the column virtualizer

    renderEmptyRowsFallback: () => {
      return (
        <Stack pl={8} pt={4} width={'100%'}>
          <Typography color={'text.secondary'} mt={1.5} variant={'subtitle2'}>
            No recorded transactions
          </Typography>
        </Stack>
      );
    },
    muiTableHeadProps: {
      sx: {
        '& .MuiTableRow-root': {
          boxShadow: 'none !important',
          bgcolor: '#F4F6FA',
        },
      },
    },
    muiTableHeadCellProps: () => {
      return {
        sx: {
          width: 'fit-content',
          px: 1.5,
          position: 'relative',
          boxShadow: 'none',
          fontWeight: 500,
          border: 'none',
          height: 40,
          '&:not(:last-of-type)': {
            '&:after': {
              display: 'block',
              content: "''",
              position: 'absolute',
              right: '1px',
              top: '50%',
              width: '1px',
              height: '18px',
              bgcolor: '#D2D6E1',
              transform: 'translateY(-50%)',
            },
          },
        },
      };
    },
    muiTableBodyRowProps: () => {
      return {
        sx: {
          width: 'fit-content',
          boxShadow: 'none',
          '& td': {
            borderBottom: 'none !important',
          },
          '& .MuiTableCell-body': {
            p: 1.5,
            position: 'relative',
            '&:before': {
              display: 'block',
              content: "''",
              position: 'absolute',
              right: '1px',
              top: '50%',
              width: '1px',
              height: '18px',
              bgcolor: '#D2D6E1',
              transform: 'translateY(-50%)',
            },
          },
          '&[data-pinned="true"]': {
            bgcolor: 'white !important',
            '& td': {
              fontWeight: '600 !important',
              '&:after': {
                bgcolor: 'transparent !important',
              },
              '&:before': {
                display: 'none',
              },
            },
          },
        },
      };
    },
  });

  const onClickToClose = useCallback(() => {
    close();
    setFormData({
      dataReceivedTime: null,
      dateDue: '',
      paymentMethod: PaymentMethod.ach,
      totalPmt: undefined,
      nsf: LoanAnswerEnum.no,
      id: undefined,
    });
  }, [close]);

  const onClickToSave = useCallback(
    async () => {
      const postData = {
        id: formData.id,
        dataReceivedTime: format(
          formData.dataReceivedTime as Date,
          'yyyy-MM-dd',
        ),
        dateDue: format(
          new Date(formData?.dateDue ? formData.dateDue : dateDue),
          'yyyy-MM-dd',
        ),
        paymentMethod: formData.paymentMethod,
        totalPmt: formData.totalPmt,
        nsf: formData.nsf,
        loanId: utils.getParamsFromUrl(location.href).loanId as string,
      };
      setEditLoading(true);
      try {
        await _updateOrCreatePaymentData(postData);
        await fetchData(0, 50);
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
        setEditLoading(false);
        onClickToClose();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dateDue,
      formData.id,
      formData.dataReceivedTime,
      formData.dateDue,
      formData.paymentMethod,
      formData.totalPmt,
      formData.nsf,
      enqueueSnackbar,
      onClickToClose,
    ],
  );

  return (
    <Stack
      flex={1}
      gap={1.5}
      height={'auto'}
      maxHeight={maxHeight}
      width={'100%'}
    >
      <Stack alignItems={'center'} flexDirection={'row'} pt={3} px={3}>
        <Typography variant={'subtitle1'}>Payment history</Typography>
        {isEditable && (
          <StyledButton
            color={'info'}
            onClick={open}
            size={'small'}
            sx={{
              ml: 'auto',
            }}
            variant={'outlined'}
          >
            Add payment
          </StyledButton>
        )}
      </Stack>

      <MRT_TableContainer sx={{ height: '100%' }} table={table} />
      {list.length > 0 && (
        <LoanPaymentsGridFooter
          onPageChange={(page) => onPageChange(page)}
          onPageSizeChange={(pageSize) => onPageSizeChange(pageSize)}
          page={page}
        />
      )}

      <Drawer anchor={'right'} onClose={onClickToClose} open={visible}>
        <Stack gap={3} px={3} py={6} width={560}>
          <Stack alignItems={'center'} flexDirection={'row'}>
            <Typography variant={'subtitle1'}>Edit payment</Typography>
            <Icon
              component={LOGO_CLOSE}
              onClick={onClickToClose}
              sx={{
                width: 24,
                height: 24,
                flexShrink: 0,
                ml: 'auto',
                cursor: 'pointer',
              }}
            />
          </Stack>
          <Stack gap={3}>
            <StyledDatePicker
              disableFuture
              label={'Date received'}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  dataReceivedTime: value,
                });
              }}
              value={formData.dataReceivedTime as Date | null}
            />

            <StyledTextFieldInput
              disabled
              label={'Date due'}
              onChange={() => {
                return;
              }}
              value={formData.dateDue ? formData.dateDue : dateDue}
              variant={'outlined'}
            />

            <StyledSelect
              label={'Payment method'}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value as string as PaymentMethod,
                });
              }}
              options={PAYMENT_METHODS_OPTIONS}
              value={formData.paymentMethod}
            />

            <StyledTextFieldNumber
              label={'Payment amount'}
              onValueChange={({ floatValue }) => {
                setFormData({
                  ...formData,
                  totalPmt: floatValue,
                });
              }}
              prefix={'$'}
              value={formData.totalPmt}
            />

            <StyledCheckbox
              checked={formData.nsf === LoanAnswerEnum.yes}
              label={'Non-sufficient funds (NSF)'}
              onChange={(e, checked) => {
                setFormData({
                  ...formData,
                  nsf: checked ? LoanAnswerEnum.yes : LoanAnswerEnum.no,
                });
              }}
            />

            <Stack flexDirection={'row'} gap={3}>
              <StyledButton
                onClick={onClickToClose}
                size={'small'}
                sx={{ flex: 1 }}
                variant={'text'}
              >
                Cancel
              </StyledButton>
              <StyledButton
                disabled={
                  !isValid(formData.dataReceivedTime) ||
                  !formData.paymentMethod ||
                  !formData.totalPmt ||
                  editLoading
                }
                loading={editLoading}
                onClick={onClickToSave}
                size={'small'}
                sx={{ flex: 1 }}
              >
                Save
              </StyledButton>
            </Stack>
          </Stack>
        </Stack>
      </Drawer>
    </Stack>
  );
};

const LOAN_PAYMENT_GRID_COLUMNS = (
  editOpen: () => void,
  setFormData: any,
  cb?: (page: number, size: number) => Promise<void>,
  refresh?: () => Promise<void>,
): MRT_ColumnDef<any>[] => {
  return [
    {
      header: '',
      accessorKey: 'action',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      size: 60,
      minSize: 60,
      Cell: ({ row }) => {
        const { enqueueSnackbar } = useSnackbar();
        const { visible, open, close } = useSwitch();

        const [anchorEl, setAnchorEl] = useState<null | Element>();
        const [loading, setLoading] = useState(false);

        const onClickToDelete = useCallback(async () => {
          setLoading(true);
          const postData = {
            id: row.original.id,
          };
          try {
            await _deletePaymentData(postData);
            await refresh?.();
            await cb?.(0, 50);
          } catch (err) {
            const { header, message, variant } = err as HttpError;
            enqueueSnackbar(message, {
              variant: variant || 'error',
              autoHideDuration: AUTO_HIDE_DURATION,
              isSimple: !header,
              header,
            });
          } finally {
            setLoading(false);
            setAnchorEl(null);
            close();
          }
        }, [close, enqueueSnackbar, row.original.id]);

        return row.original.id === '-1' ? null : (
          <Stack
            alignItems={'center'}
            justifyContent={'center'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            width={'100%'}
          >
            <MoreHoriz
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setAnchorEl(e.currentTarget);
              }}
              sx={{ fontSize: 24, cursor: 'pointer', color: '#202939' }}
            />
            <GridActions
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              close={() => setAnchorEl(null)}
              open={Boolean(anchorEl)}
              options={[
                {
                  label: 'Edit payment',
                  key: 'Edit payment',
                  value: 'Edit payment',
                  icon: LOGO_EDIT,
                  action: () => {
                    editOpen();
                    setAnchorEl(null);
                    setFormData({
                      dataReceivedTime: row.original.dataReceivedTime
                        ? new Date(row.original.dataReceivedTime)
                        : null,
                      dateDue: format(
                        new Date(row.original.dateDue as string),
                        'MM/dd/yyyy',
                      ),
                      paymentMethod: row.original.paymentMethod,
                      totalPmt: row.original.totalPmt,
                      nsf: row.original.nsf,
                      id: row.original.id,
                    });
                  },
                },
                {
                  label: 'Delete',
                  key: 'Delete',
                  value: 'Delete',
                  icon: LOGO_DELETE,
                  action: () => {
                    open();
                    setAnchorEl(null);
                  },
                },
              ]}
              target={anchorEl}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            />
            <StyledDialog
              content={
                <Typography my={1.5} variant={'body2'}>
                  This action is irreversible, and the record will be
                  permanently removed from the loan.
                </Typography>
              }
              footer={
                <Stack flexDirection={'row'} gap={3}>
                  <StyledButton
                    color={'info'}
                    onClick={() => {
                      setAnchorEl(null);
                      close();
                    }}
                    size={'small'}
                    sx={{ width: 110 }}
                    variant={'outlined'}
                  >
                    No, cancel
                  </StyledButton>
                  <StyledButton
                    color={'error'}
                    disabled={loading}
                    loading={loading}
                    onClick={onClickToDelete}
                    size={'small'}
                    sx={{ width: 110 }}
                  >
                    Yes, delete
                  </StyledButton>
                </Stack>
              }
              header={'Are you sure you want to delete this payment history?'}
              open={visible}
            />
          </Stack>
        );
      },
    },
    {
      accessorKey: 'dataReceivedTime',
      header: 'Date received',
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? !row.getIsPinned()
                  ? utils.formatDate(renderedCellValue as string)
                  : renderedCellValue
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? !row.getIsPinned()
                  ? utils.formatDate(renderedCellValue as string)
                  : renderedCellValue
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'dateDue',
      header: 'Date due',
      size: 120,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          !row.getIsPinned() && (
            <Tooltip
              title={
                utils.notNull(renderedCellValue)
                  ? utils.formatDate(renderedCellValue as string)
                  : '-'
              }
            >
              <Typography
                color={
                  row.original.nsf === LoanAnswerEnum.yes
                    ? '#DE6449'
                    : 'text.primary'
                }
                sx={{
                  ...ellipsisStyle,
                  width: '100%',
                }}
                variant={'body2'}
              >
                {utils.notNull(renderedCellValue)
                  ? utils.formatDate(renderedCellValue as string)
                  : '-'}
              </Typography>
            </Tooltip>
          )
        );
      },
    },
    {
      accessorKey: 'pmtDayVariance',
      header: 'Pmt day variance',
      size: 200,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          !row.getIsPinned() && (
            <Tooltip title={renderedCellValue}>
              <Typography
                color={
                  row.original.nsf === LoanAnswerEnum.yes
                    ? '#DE6449'
                    : 'text.primary'
                }
                sx={{
                  ...ellipsisStyle,
                  width: '100%',
                }}
                variant={'body2'}
              >
                {renderedCellValue}
              </Typography>
            </Tooltip>
          )
        );
      },
    },
    {
      accessorKey: 'isAch',
      header: 'ACH',
      size: 100,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          !row.getIsPinned() && (
            <Tooltip title={renderedCellValue ? 'ACH' : '-'}>
              <Typography
                color={
                  row.original.nsf === LoanAnswerEnum.no
                    ? '#DE6449'
                    : 'text.primary'
                }
                sx={{
                  ...ellipsisStyle,
                  width: '100%',
                }}
                variant={'body2'}
              >
                {renderedCellValue ? 'ACH' : '-'}
              </Typography>
            </Tooltip>
          )
        );
      },
    },
    {
      accessorKey: 'paymentType',
      header: 'Payment type',
      size: 180,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          !row.getIsPinned() && (
            <Tooltip title={renderedCellValue}>
              <Typography
                color={
                  row.original.nsf === LoanAnswerEnum.yes
                    ? '#DE6449'
                    : 'text.primary'
                }
                sx={{
                  ...ellipsisStyle,
                  width: '100%',
                }}
                variant={'body2'}
              >
                {/*todo:enum?*/}
                {renderedCellValue}
              </Typography>
            </Tooltip>
          )
        );
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment method',
      size: 180,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          !row.getIsPinned() && (
            <Tooltip title={renderedCellValue}>
              <Typography
                color={
                  row.original.nsf === LoanAnswerEnum.yes
                    ? '#DE6449'
                    : 'text.primary'
                }
                sx={{
                  ...ellipsisStyle,
                  width: '100%',
                }}
                variant={'body2'}
              >
                {/*todo:enum?*/}
                {renderedCellValue}
              </Typography>
            </Tooltip>
          )
        );
      },
    },
    {
      accessorKey: 'totalPmt',
      header: 'Total pmt',
      size: 120,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'totalInterestReceived',
      header: 'Total interest received',
      size: 210,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    //{
    //  accessorKey: 'defaultInterestReceived',
    //  header: 'Default interest received',
    //  size: 220,
    //  muiTableBodyCellProps: { align: 'center' },
    //  muiTableHeadCellProps: { align: 'center' },
    //  Cell: ({ renderedCellValue, row }) => {
    //    return (
    //      <Tooltip title={renderedCellValue}>
    //        <Typography
    //          sx={{
    //            ...ellipsisStyle,
    //            width: '100%',
    //            fontWeight: row.getIsPinned() ? 600 : 400,
    //          }}
    //          variant={'body2'}
    //        >
    //          {utils.notNull(renderedCellValue)
    //            ? utils.formatDollar(renderedCellValue as number)
    //            : '-'}
    //        </Typography>
    //      </Tooltip>
    //    );
    //  },
    //},
    //{
    //  accessorKey: 'interestRateReceived',
    //  header: 'Interest rate received',
    //  size: 210,
    //  muiTableBodyCellProps: { align: 'center' },
    //  muiTableHeadCellProps: { align: 'center' },
    //  Cell: ({ renderedCellValue, row }) => {
    //    return (
    //      <Tooltip title={renderedCellValue}>
    //        <Typography
    //          sx={{
    //            ...ellipsisStyle,
    //            width: '100%',
    //            fontWeight: row.getIsPinned() ? 600 : 400,
    //          }}
    //          variant={'body2'}
    //        >
    //          {utils.notNull(renderedCellValue)
    //            ? utils.formatDollar(renderedCellValue as number)
    //            : '-'}
    //        </Typography>
    //      </Tooltip>
    //    );
    //  },
    //},
    {
      accessorKey: 'principalReceived',
      header: 'Principal received',
      size: 200,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'accruedLateCharges',
      header: 'Accrued late charges',
      size: 210,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'waivedLateCharges',
      header: 'Waive late charges',
      size: 190,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'reservePmt',
      header: 'Reserve pmt',
      size: 190,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'reserveRestricted',
      header: 'Reserve restricted',
      size: 190,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip
            title={
              utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'
            }
          >
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
                fontWeight: row.getIsPinned() ? 600 : 400,
              }}
              variant={'body2'}
            >
              {utils.notNull(renderedCellValue)
                ? utils.formatDollar(renderedCellValue as number)
                : '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: 'additionalInformation',
      header: 'Additional information',
      size: 190,
      muiTableBodyCellProps: { align: 'center' },
      muiTableHeadCellProps: { align: 'center' },
      Cell: ({ renderedCellValue, row }) => {
        return (
          <Tooltip title={renderedCellValue ?? '-'}>
            <Typography
              color={
                row.original.nsf === LoanAnswerEnum.yes
                  ? '#DE6449'
                  : 'text.primary'
              }
              sx={{
                ...ellipsisStyle,
                width: '100%',
              }}
              variant={'body2'}
            >
              {renderedCellValue ?? '-'}
            </Typography>
          </Tooltip>
        );
      },
    },
  ] as MRT_ColumnDef<any>[];
};
