import { FC } from 'react';
import { Pagination, Stack, TablePagination, Typography } from '@mui/material';

import { utils } from '@/utils';
import {
  GridAlamedaSummaryProps,
  ResponseGridAlamedaTable,
} from '@/types/pipeline/youland';

interface GridAlamedaFooterProps {
  footerData: GridAlamedaSummaryProps;
  page: ResponseGridAlamedaTable['page'];
  onPageSizeChange: (pageSize: number) => void;
  onPageChange: (page: number) => void;
}

export const GridAlamedaFooter: FC<GridAlamedaFooterProps> = ({
  footerData,
  page,
  onPageSizeChange,
  onPageChange,
}) => {
  return (
    <Stack
      alignItems={'center'}
      flexDirection={'row'}
      height={48}
      justifyContent={'space-between'}
      px={4}
    >
      <Stack flexDirection={'row'} gap={3}>
        <Typography variant={'subtitle2'}>
          Total amount: {utils.formatDollar(footerData.totalLoanAmount)}
        </Typography>
        <Typography variant={'subtitle2'}>
          Number of loans: {footerData.totalItems}
        </Typography>
        <Typography variant={'subtitle2'}>
          Weighted average note sheet:{' '}
          {utils.formatPercent(footerData.weightedAverageSheet, 2)}
        </Typography>
        <Typography variant={'subtitle2'}>
          Weighted average margin:{' '}
          {utils.formatPercent(footerData.weightedAverageMargin, 2)}
        </Typography>
      </Stack>
      <Stack
        alignItems={'center'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        sx={{
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <TablePagination
          component={'div'}
          count={page.totalElements}
          onPageChange={() => {
            return;
          }}
          onRowsPerPageChange={(e) => {
            onPageSizeChange(parseInt(e?.target?.value));
          }}
          page={page.number}
          rowsPerPage={page.size}
          rowsPerPageOptions={[50, 100]}
          slotProps={{
            actions: {
              previousButton: {
                sx: { display: 'none' },
              },
              nextButton: {
                sx: { display: 'none' },
              },
            },
            select: {
              MenuProps: {
                MenuListProps: {
                  sx: {
                    p: 0,
                    m: 0,
                    '& .MuiMenuItem-root:hover': {
                      bgcolor: 'rgba(144, 149, 163, 0.1) !important',
                    },
                    '& .Mui-selected': {
                      bgcolor: 'hsla(222,100%,95%,1) !important',
                    },
                    '& .Mui-selected:hover': {
                      bgcolor: 'hsla(222,100%,92%,1) !important',
                    },
                    '& .MuiMenuItem-root': {
                      fontSize: 12,
                      color: 'text.primary',
                    },
                  },
                },
              },
            },
          }}
          sx={{
            color: 'text.secondary',
            '& .MuiTablePagination-input': {
              fontSize: 12,
              ml: 0,
            },
          }}
        />

        <Pagination
          count={page.totalPages}
          onChange={(e, page) => {
            onPageChange(page);
          }}
          page={page.number + 1}
          shape={'circular'}
          sx={{
            fontSize: 14,
            '& .MuiPaginationItem-previousNext': {
              color: 'text.primary',
            },
            '& .Mui-disabled svg path': {
              fill: '#cdcdcd',
              '& svg path': {
                fill: 'background.disabled',
              },
            },
          }}
          variant={'text'}
        />
      </Stack>
    </Stack>
  );
};