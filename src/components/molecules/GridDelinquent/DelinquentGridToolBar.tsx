import { Stack } from '@mui/material';
import React, { FC, useEffect, useRef } from 'react';

import { StyledSearchSelectMultiple, StyledSearchTextFieldInput } from '@/components/atoms';
import {
  combineColumns,
  delinquentColumns,
  GridMoreIconButton,
  SortButton,
} from '@/components/molecules';
import { useDebounceFn } from '@/hooks';
import { useMst } from '@/models/Root';
import { PortfolioGridTypeEnum, SortDirection } from '@/types/enum';
import useSWR from 'swr';
import { _getAllStatus } from '@/request';
import { enqueueSnackbar } from 'notistack';


export const DelinquentGridToolBar: FC = () => {
  const {
    portfolio: { delinquentGridModel },
  } = useMst();

  const propertyAddressRef = useRef<HTMLInputElement | null>(null);

  const [, , updateQueryDebounce] = useDebounceFn(
    delinquentGridModel.queryModel.updateQueryCondition,
    500,
  );

  const { data } = useSWR('_getAllStatus', async () => {
    return await _getAllStatus().catch(({ message, variant, header }) => {
      
      enqueueSnackbar(message ?? 'error!', {
        variant,
        isSimple: !header,
        header,
      });
    });
  });

  useEffect(() => {
    if (propertyAddressRef.current) {
      propertyAddressRef.current.value =
        delinquentGridModel.queryModel.searchCondition.keyword || '';
    }
    // getDelinquentRangeOpt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack alignItems={'center'} direction={'row'} gap={1.5}>
      <StyledSearchTextFieldInput
        handleClear={() => {
          propertyAddressRef.current!.value = '';
          updateQueryDebounce('keyword', '');
        }}
        inputProps={{ ref: propertyAddressRef }}
        onChange={(e) => {
          updateQueryDebounce('keyword', e.target.value);
        }}
        variant={'outlined'}
      />
      <StyledSearchSelectMultiple
        label={'Status'}
        onChange={(e) => {
          updateQueryDebounce('repaymentStatusList', e);
        }}
        options={data?.data || []}
        value={delinquentGridModel.queryModel.searchCondition.repaymentStatusList}
      />
      {delinquentGridModel.queryModel.sort.length > 0 && (
        <SortButton
          handleClear={(e) => {
            e.stopPropagation();
            delinquentGridModel.queryModel.updateSort([]);
          }}
          handleClick={() => {
            delinquentGridModel.queryModel.updateSort([
              {
                ...delinquentGridModel.queryModel.sort[0],
                direction:
                  delinquentGridModel.queryModel.sort[0].direction ===
                  SortDirection.DESC
                    ? SortDirection.ASC
                    : SortDirection.DESC,
              },
            ]);
          }}
          sortItems={delinquentGridModel.queryModel.sort[0]}
        />
      )}
      <GridMoreIconButton
        columns={combineColumns(
          delinquentColumns,
          delinquentGridModel.orderColumns,
        )}
        gridType={PortfolioGridTypeEnum.DELINQUENT}
        handleSave={(columns) => {
          delinquentGridModel.updateOrderColumns(columns);
        }}
      />
    </Stack>
  );
};
