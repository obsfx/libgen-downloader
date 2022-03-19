import React from 'react';
import { Box } from 'ink';

import { SEARCH_LAYOUT } from '../constants/layouts';
import { LayoutWrapper, Layout } from './layouts/Layout';
import Search from './layouts/Search';

const App: React.FC = () => {
  return (
    <Box>
      <LayoutWrapper initialLayout={SEARCH_LAYOUT}>
        <Layout layoutName={SEARCH_LAYOUT}>
          <Search />
        </Layout>
      </LayoutWrapper>
    </Box>
  );
};

export default App;
