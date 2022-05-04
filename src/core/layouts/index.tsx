import React from 'react';

import { SEARCH_LAYOUT } from '../../constants/layouts';
import { LayoutWrapper, Layout } from './Layout';
import Search from './search';

const Layouts: React.FC<{}> = ({}) => {
  return (
    <LayoutWrapper initialLayout={SEARCH_LAYOUT}>
      <Layout layoutName={SEARCH_LAYOUT}>
        <Search />
      </Layout>
    </LayoutWrapper>
  );
};

export default Layouts;
