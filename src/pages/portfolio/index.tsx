import Head from 'next/head';
import dynamic from 'next/dynamic';

import { observer } from 'mobx-react-lite';

const DynamicPortfolio = dynamic(
  () => import('@/components/organisms/Portfolio').then((mod) => mod.Portfolio),
  {
    ssr: true,
  },
);

const PortfolioPage = observer(() => {
  return (
    <>
      <Head>
        <meta content="YouLand Software Team" name="description" />
        <meta content="YouLand Point Of Sales System" name="keywords" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <DynamicPortfolio />
    </>
  );
});

export default PortfolioPage;
