import { useDebounceFn } from '@/hooks';
import {
  MRT_Column,
  MRT_TableContainer,
  MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';
import router from 'next/router';
import React, { CSSProperties, FC, ReactEventHandler } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import { useDebounce } from 'react-use';

type GroupLoansProps = MRT_TableOptions<any> & {
  loading?: boolean;
  handleHeaderClick?: (
    e: React.MouseEvent<HTMLTableCellElement>,
    column: MRT_Column<any>,
  ) => void;
  columnOrder?: string[];
};

export const GroupLoans: FC<GroupLoansProps> = ({
  columns,
  data,
  rowCount,
  loading,
  columnOrder,
  handleHeaderClick,
  ...rest
}) => {
  // const handleExpandData = (data: ExpandedState) => {
  //   if (data === true) {
  //     return pipelineGroupingList.map((item) => ({
  //       loanOfficerId: item.loanOfficerId,
  //       collapsed: true,
  //     }));
  //   }
  //   if (!Object.keys(expanded).length) {
  //     return [];
  //   }
  //   return Object.keys(data).map((loanOfficerId) => ({
  //     loanOfficerId,
  //     collapsed: data[loanOfficerId],
  //   }));
  // };

  const [, , updateColumnWidth] = useDebounceFn((param: unknown) => {
    console.log(param);
  }, 500);

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount,
    enableExpandAll: true, //hide expand all double arrow in column header
    enableExpanding: true,
    enableBottomToolbar: false, //pipelineType === PipelineDisplayMode.LIST_MODE,
    paginateExpandedRows: true, //When rows are expanded, do not count sub-rows as number of rows on the page towards pagination
    enableTopToolbar: false,
    enableColumnActions: false, //pipelineType === PipelineDisplayMode.LIST_MODE,
    enableColumnOrdering: false,
    enableSorting: false,
    enableColumnDragging: false,
    enableGrouping: true,
    enableColumnResizing: true,
    enableRowVirtualization: true,
    enableColumnVirtualization: true,
    enableColumnPinning: true,
    manualPagination: true,
    // getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder: columnOrder || [],
      // isLoading: isValidating,
      showSkeletons: loading,
    },
    initialState: {
      // showSkeletons: false,
      showProgressBars: false,
      // expanded: defaultExpanded,
    },
    getRowId: (row) => {
      if (row.servicingLoans?.length) {
        return row.groupById;
      }
      return row.loanId;
    }, //default
    getSubRows: (row) => row.servicingLoans,
    rowVirtualizerOptions: { overscan: 5 }, //optionally customize the row virtualizer
    columnVirtualizerOptions: { overscan: 5 }, //optionally customize the column virtualizer
    muiExpandButtonProps: {
      sx: {
        width: 20,
        height: 20,
      },
      title: '',
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        //handleExpandClick();
      },
    },
    icons: {
      KeyboardDoubleArrowDownIcon: (props: { style: CSSProperties }) => {
        const { style } = props;

        const transformValue =
          style.transform === 'rotate(-180deg)'
            ? 'rotate(0deg)'
            : 'rotate(-90deg)';
        return (
          <KeyboardDoubleArrowDownIcon
            style={{ ...style, transform: transformValue }}
            sx={{ fontSize: 20 }}
          />
        );
      },
      ExpandMoreIcon: (props: { style: CSSProperties }) => {
        const { style } = props;

        const transformValue =
          style.transform === 'rotate(-180deg)'
            ? 'rotate(0deg)'
            : 'rotate(-90deg)';

        return (
          <ExpandMoreIcon
            style={{ ...style, transform: transformValue }}
            sx={{ fontSize: 20 }}
          />
        );
      },
    },
    muiTableBodyRowProps: ({ row }) => {
      const temp = {
        sx: {
          '& .MuiTableCell-root:last-child': {
            borderBottom: 'none',
            // borderLeft: row.original.servicingLoans ? 'none' : '1px solid',
            // borderBottom: '1px solid',
            // borderColor: '#D2D6E1 !important',
          },
          '& .MuiTableCell-root:first-of-type': {
            width: 40,
            minWidth: 40,
            border: 'none',
          },
          '& .MuiTableCell-root': {
            // borderBottom: 'none',
          },
          boxShadow: 'none',
        },
      };

      return row.getIsExpanded()
        ? {
            ...temp,
            '& .MuiTableCell-root': {
              borderBottom: '1px solid ',
            },
          }
        : temp;
    },
    muiTableBodyCellProps: ({ row }) => {
      return {
        sx: {
          px: 1.5,
          py: 1.5,
          bgcolor: 'transparent',
          // borderLeft: row.original.servicingLoans ? 'none' : '1px solid',
          // borderColor: '#D2D6E1 !important',
          overflow: 'visible',
          '&:first-of-type button': {
            visibility: row.original.servicingLoans ? 'visible' : 'hidden',
          },
          borderBottom: 'none',
        },
        onClick: async () => {
          const { original } = row;
          const { loanId } = original;
          if (original.servicingLoans) {
            row.toggleExpanded();
          }
          if (!original.servicingLoans) {
            await router.push({
              pathname: '/loan/overview',
              query: { loanId },
            });
          }
        },
      };
    },
    muiTableHeadProps: {
      sx: {
        opacity: 1,
        '& .MuiTableRow-head': {
          boxShadow: 'none',
        },

        '& .Mui-TableHeadCell-Content-Wrapper': {
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '20px',
          whiteSpace: 'nowrap',
        },
        '& .MuiTableCell-root': {
          border: 'none',
        },
        '& .MuiTableCell-root:last-child': {
          bgcolor: '#F4F6FA',
        },
        '& .MuiTableCell-root:first-of-type': {
          width: 40,
          minWidth: 40,
        },
      },
    },
    muiTableHeadCellProps: (props) => ({
      sx: {
        bgcolor: '#F4F6FA',
        opacity: 1,
        border: 'none',
        minHeight: 36,
        px: 1,
        py: 1.25,
        justifyContent: 'center',
        '& .Mui-TableHeadCell-Content-Labels ': {
          pl: 0,
        },
        '& .Mui-TableHeadCell-Content-Wrapper': {
          fontWeight: 600,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          webkitBoxOrient: 'vertical',
          webkitLineClamp: 2,
          display: '-webkit-box',
          whiteSpace: 'normal',
          color: '#636A7C',
        },
        '& .Mui-TableHeadCell-ResizeHandle-Wrapper': {
          mr: '-8px',
        },
        '& .Mui-TableHeadCell-ResizeHandle-Divider': {
          borderWidth: 1,
        },
        '&[data-pinned="true"]:before': {
          bgcolor: 'transparent',
        },
        cursor: 'pointer',
        '&:hover': {
          bgcolor: '#ececec',
        },
      },
      onClick: (e) => {
        e.stopPropagation();
        if (props.column.id === 'mrt-row-expand') {
          return;
        }
        handleHeaderClick?.(e, props.column);
      },
    }),
    muiTableContainerProps: {
      style: {
        maxHeight: 'calc(100vh - 212px)',
      },
    },
    muiExpandAllButtonProps: (props) => {
      return {
        title: '',
        onClick: () => {
          props.table.toggleAllRowsExpanded();
          //haneleExpandAllClick();
          // set(props.table.toggleAllRowsExpanded, !props.table.getIsAllRowsExpanded());
        },
      };
    },
    ...rest,
    /*    muiTablePaperProps: {
              sx: {
                boxShadow: 'none',
                '& .MuiAlert-message span': {
                  visibility: 'hidden',
                },
                borderRadius: 0,
              },
            },
            muiBottomToolbarProps: {
              sx: {
                '& .MuiTypography-body2': {
                  fontSize: 14,
                },
                '& .MuiInputLabel-root,& .MuiInput-root': {
                  fontSize: 14,
                },
              },
            },
            muiTableBodyProps: {
              sx: {
                '& tr .groupingTitle': {
                  color: 'text.primary',
                },
                '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                  borderBottom: 'none',
                },
              },
            },
            muiPaginationProps: {
              SelectProps: {
                sx: {
                  '& .MuiInputBase-input:focus': {
                    bgcolor: 'transparent',
                  },
                },
              },
            },
            muiSelectCheckboxProps: {
              sx: {
                width: 20,
                height: 20,
                m: '0 auto',
              },
            },
            muiSelectAllCheckboxProps: {
              sx: {
                display: 'block',
                m: '0 auto',
              },
            },*/
    /* displayColumnDefOptions: {
              'mrt-row-expand': {
                size: 40, //make the expand column wider
                Cell: ({ row, table }) => {
                  return (
                    <>
                      {row.subRows?.length ? (
                        <MRT_ExpandButton row={row} table={table} />
                      ) : null}
                    </>
                  );
                },
              },
            },
            columnResizeMode: 'onChange',
            muiExpandAllButtonProps: (props) => {
              return {
                onClick: () => {
                  set(
                    props.table.toggleAllRowsExpanded,
                    !props.table.getIsAllRowsExpanded(),
                  );
                },
                sx: {
                  p: 0,
                  width: 'auto',
                  height: 'auto',
                },
              };
            },
            muiExpandButtonProps: {
              sx: {
                p: 0,
                width: 'auto',
                height: 'auto',
              },
            },
            paginationDisplayMode: 'custom',
            muiCircularProgressProps: {
              Component: (
                <Stack
                  alignItems={'center'}
                  direction={'row'}
                  justifyContent={'center'}
                  mt={8}
                >
                  <CircularProgress sx={{ fontSize: 18 }} />
                </Stack>
              ),
            },
            memoMode: 'cells',
            onColumnPinningChange: setColumnPiningState,
            ...TableDefaultProps(pipelineType),
            muiTableHeadCellProps: (props) => {
              return {
                sx: { ...defaultProps(pipelineType).muiTableHeadCellProps.sx },
                onClick: (e) => {
                  if (
                    pipelineType === PipelineDisplayMode.GROUP_MODE ||
                    (e.target as HTMLElement).className?.includes(
                      'Mui-TableHeadCell-ResizeHandle-Wrapper',
                    ) ||
                    (e.target as HTMLElement).className?.includes(
                      'Mui-TableHeadCell-ResizeHandle-Divider',
                    )
                  ) {
                    return;
                  }
                  const id = props.column.id;
                  if (id === 'mrt-row-select') {
                    return;
                  }
                  ColumnIdToSortIdMap[props.column.id]
                    ? setHeaderSortDisabled(false)
                    : setHeaderSortDisabled(true);

                  setAnchorElHeader(e.currentTarget);
                  setTableHeaderIndex(props.column.getIndex());
                  setHeaderColumn(props.column);
                },
              };
            },*/
  });

  const columnSizing: Record<string, number> = table.getState().columnSizing;
  const columnPining = table.getState().columnPinning;
  const expanded = table.getState().expanded;

  const [, cancelUpdateColumnWidth] = useDebounce(
    () => {
      if (Object.keys(columnSizing).length) {
        //handle column sizing
        console.log('columnSizing', columnSizing);
      }
      // setColumnWidth(
      //     Object.keys(columnSizing).map((field) => ({
      //       field,
      //       columnWidth: columnSizing[field],
      //     })),
      // );
    },
    500,
    [columnSizing],
  );

  // const [, cancelUpdateGroupExpanded] = useDebounce(
  //   () => {
  //     const result = handleExpandData(expanded);
  //     updateGroupExpanded(result);
  //     setUserSetting({
  //       ...setting,
  //       userConfig: {
  //         ...setting.userConfig,
  //         pipelineExpandedResponseList: result,
  //       },
  //     });
  //   },
  //   500,
  //   [expanded],
  // );

  return (
    <MRT_TableContainer
      // sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      table={table}
    />
  );
};
