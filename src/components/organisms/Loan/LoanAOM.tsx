import { Box, CircularProgress, Fade, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { FC, useRef, useState } from 'react';
import { useAsync, useAsyncFn } from 'react-use';

import {
  StyledButton,
  StyledDatePicker,
  StyledHeaderAddressInfo,
  StyledSelect,
  StyledTextFieldInput,
} from '@/components/atoms';
import { Layout, SideMenu } from '@/components/molecules';
import { _creatAomPdf, _getAOMInfo, _getAomInvestorList } from '@/request';
import { CreateAomPdfParam } from '@/types/loan/aom';
import { utils } from '@/utils';
import { HttpError } from '@/types';

export const LoanAOM: FC = (props) => {
  const router = useRouter();
  const { loanId } = router.query;
  const formRef = useRef<HTMLFormElement | null>(null);
  const pdfFile = useRef(null);
  // const { renderFile } = useRenderPdf(pdfFile);

  const [instrumentNumber, setInstrumentNumber] = useState('');
  const [executionDate, setExtensionDate] = useState<Date | null>(new Date());
  const [buyer, setBuyer] = useState('');
  const [buyersOpts, setBuyersOpts] = useState<Option[]>([]);

  useAsync(async () => {
    return await _getAomInvestorList().then((res) => {
      if (res.data) {
        setBuyersOpts(
          res.data.map((item) => ({
            label: item.investorName,
            key: item.id,
            value: item.id,
          })),
        );
      }
      getAOMInfo();
      return res;
    });
  }, []);

  const [aomState, getAOMInfo] = useAsyncFn(async () => {
    return typeof loanId === 'string'
      ? await _getAOMInfo(parseInt(loanId as string))
          .then((res) => {
            if (res.data.investorId) {
              setBuyer(res.data.investorId);
            }
            if (typeof res.data.instrumentNumber === 'string') {
              setInstrumentNumber(res.data.instrumentNumber);
            }
            if (res.data.recordedDate) {
              setExtensionDate(new Date(res.data.recordedDate));
            }
            return res;
          })
          .catch(({ message, variant, header }) => {
            enqueueSnackbar(message, { variant, isSimple: !header, header });
          })
      : null;
  }, [loanId]);

  const value = aomState.value;

  const cardInfo: Record<string, any> = {
    'Loan number': value?.data?.systemLoanNumber,
    'Original Principal Loan Amount': utils.formatDollar(
      value?.data?.totalLoanAmount || 0,
    ),
    'Monthly P&I Payment': utils.formatDollar(value?.data?.monthlyPayment || 0),
    'Date of 1st Payment': value?.data?.firstPaymentDate,
    'Maturity Date': value?.data?.maturityDate,
    'Note Interest Rate': utils.formatPercent(value?.data?.interestRate || 0),
  };

  const [state, createPdf] = useAsyncFn(
    async (param: CreateAomPdfParam) => {
      if (!formRef.current?.reportValidity()) {
        return;
      }
      try {
        await _creatAomPdf(param);
        await getAOMInfo();
      } catch (e) {
        const { message, variant, header } = e as unknown as HttpError;
        enqueueSnackbar(message, {
          variant,
          isSimple: !header,
          header,
        });
      }
    },
    [formRef.current],
  );
  return (
    <Layout isHomepage={false} sideMenu={<SideMenu />}>
      <Box height={'100%'} overflow={'auto'}>
        {aomState.loading ? (
          <Stack
            alignItems={'center'}
            height={'100%'}
            justifyContent={'center'}
            width={'100%'}
          >
            <CircularProgress sx={{ color: '#E3E3EE' }} />
          </Stack>
        ) : (
          <Stack direction={'row'} justifyContent={'center'} p={6}>
            {value?.data && (
              <Stack maxWidth={900} spacing={3} width={'100%'}>
                <StyledHeaderAddressInfo
                  address={value.data.propertyFullAddress}
                  loanNumber={value.data.systemLoanNumber}
                  status={value.data.repaymentStatusEnum}
                />
                <Typography color={'text.hover'} fontWeight={600}>
                  Generate Assignment of Mortgage
                </Typography>
                <Stack direction={'row'} gap={3}>
                  <Stack
                    bgcolor={'#F0F4FF'}
                    borderRadius={2}
                    component={'ul'}
                    gap={1.5}
                    p={3}
                    width={'50%'}
                  >
                    {Object.keys(cardInfo).map((item, index) => (
                      <Stack
                        direction={'row'}
                        justifyContent={'space-between'}
                        key={index}
                      >
                        <Typography color={'text.hover'} variant={'body2'}>
                          {item}
                        </Typography>
                        <Typography variant={'subtitle2'}>
                          {cardInfo[item]}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Stack
                    autoComplete={'off'}
                    component={'form'}
                    gap={3}
                    ref={formRef}
                    width={'50%'}
                  >
                    <StyledDatePicker
                      label={'Recorded on'}
                      onChange={(value) => {
                        setExtensionDate(value);
                      }}
                      slotProps={{
                        textField: {
                          required: true,
                        },
                      }}
                      value={executionDate}
                    />
                    <StyledTextFieldInput
                      label={'Instrument number'}
                      onChange={(e) => {
                        setInstrumentNumber(e.target.value as string);
                      }}
                      required
                      value={instrumentNumber}
                      variant={'outlined'}
                    />
                    <StyledSelect
                      label={'Prospective buyer'}
                      onChange={(e) => {
                        setBuyer(e.target.value as string);
                      }}
                      options={buyersOpts}
                      value={buyer}
                    />
                  </Stack>
                </Stack>
                <StyledButton
                  loading={state.loading}
                  onClick={async () => {
                    await createPdf({
                      loanId: parseInt(loanId as string),
                      recordedDate: format(executionDate as Date, 'yyyy-MM-dd'),
                      instrumentNumber: instrumentNumber + '',
                      investorId: buyer,
                      investorName: buyersOpts.find(
                        (item) => item.value === buyer,
                      )?.label as string,
                    });
                  }}
                  size={'small'}
                  sx={{ alignSelf: 'flex-start', width: 181 }}
                  variant={'outlined'}
                >
                  Generate AOM
                </StyledButton>
                <Fade in={!!value?.data?.fileInfo}>
                  <Box
                    color={'primary.main'}
                    component={'a'}
                    fontSize={18}
                    onClick={async () => {
                      window.open(value?.data?.fileInfo?.url);
                    }}
                    sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    AOM -{' '}
                    {utils.formatDate(
                      value?.data?.fileInfo?.uploadTime,
                      'MM/d/yyyy',
                    )}
                  </Box>
                </Fade>
              </Stack>
            )}
          </Stack>
        )}
      </Box>
    </Layout>
  );
};