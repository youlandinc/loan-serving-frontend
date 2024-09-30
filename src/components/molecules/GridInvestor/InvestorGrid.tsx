import { allLoansModel } from '@/models/gridModel';
import { ISortItemModel } from '@/models/gridModel/allLoansModel/gridQueryModel';
import { Stack } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { observer } from 'mobx-react-lite';
import React, { FC, useMemo, useState } from 'react';
import useSWR from 'swr';

import {
  AllLoansPagination,
  ColumnsHeaderMenus,
  commonColumns,
  defaultColumnPining,
  groupCommonColumns,
  GroupLoans,
  resortColumns,
  transferFirstColumn,
  transferOrderColumnsKeys,
} from '@/components/molecules';
import { useMst } from '@/models/Root';
import { _getGroupByInvestor } from '@/request/portfolio/investor';
import { PortfolioGridTypeEnum, SortDirection } from '@/types/enum';

export const InvestorGrid: FC = observer(() => {
  const {
    portfolio: { investorGridModel, displayType },
  } = useMst();

  const [headerColumnId, setHeaderColumnId] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  // const [tableHeaderIndex, setTableHeaderIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();

  const configColumnsOrderKeysArr = investorGridModel.orderColumns?.length
    ? transferOrderColumnsKeys(investorGridModel.orderColumns)
    : [];

  const expandedData =
    investorGridModel.expandedColumns?.reduce(
      (pre, cur) => {
        pre[cur.dropDownId] = true;
        return pre;
      },
      {} as Record<string, boolean>,
    ) || {};

  const { data, isLoading } = useSWR(
    displayType === PortfolioGridTypeEnum.BY_INVESTOR
      ? [
          {
            ...investorGridModel.queryModel,
            searchCondition: {
              ...investorGridModel.queryModel.searchCondition,
              investors: [
                ...investorGridModel.queryModel.searchCondition.investors,
              ],
              repaymentStatusList: [
                ...investorGridModel.queryModel.searchCondition
                  .repaymentStatusList,
              ],
            },
            sort: [...investorGridModel.queryModel.sort],
          },
          displayType,
        ]
      : null,
    async ([p]) => {
      return await _getGroupByInvestor(p);
    },
    // { revalidateOnMount: true },
  );

  const columns = useMemo(() => {
    return investorGridModel.orderColumns.length
      ? transferFirstColumn(
          resortColumns(investorGridModel.orderColumns, commonColumns),
        )
      : transferFirstColumn(commonColumns);
  }, [configColumnsOrderKeysArr.join('')]);

  const rowsTotal = data?.data?.totalItems ?? 0;
  const totalLoanAmount = data?.data?.totalAmount ?? 0;

  return (
    <>
      <Stack>
        <GroupLoans
          columns={columns}
          data={data?.data?.contents || []}
          expandedData={expandedData}
          gridType={PortfolioGridTypeEnum.BY_INVESTOR}
          handleSort={(param) => {
            investorGridModel.queryModel.updateSort([
              {
                property: param.property, //.id as string,
                direction: SortDirection.DESC,
                ignoreCase: true,
                label: param.label,
              },
            ] as ISortItemModel[]);
          }}
          loading={isLoading}
        />
        <AllLoansPagination
          currentPage={0}
          rowCount={rowsTotal}
          rowsPerPage={0}
          showPage={false}
          sx={{ borderTop: '1px solid #EDF1FF' }}
          totalLoanAmount={totalLoanAmount}
        />
      </Stack>
      {/*<ColumnsHeaderMenus*/}
      {/*  anchorEl={anchorEl}*/}
      {/*  handleSort={() => {*/}
      {/*    investorGridModel.queryModel.updateSort([*/}
      {/*      {*/}
      {/*        property: headerColumnId, //.id as string,*/}
      {/*        label: headerTitle as string,*/}
      {/*        direction: SortDirection.DESC,*/}
      {/*        ignoreCase: true,*/}
      {/*      },*/}
      {/*    ] as ISortItemModel[]);*/}
      {/*  }}*/}
      {/*  onClose={() => setAnchorEl(null)}*/}
      {/*  open={Boolean(anchorEl)}*/}
      {/*  type={'group'}*/}
      {/*/>*/}
    </>
  );
});
