import React from 'react';
import { Box } from 'ink';

import { FETCH_CONFIG_LAYOUT, SEARCH_LAYOUT } from '../constants/layouts';
import { LayoutWrapper, Layout } from './layouts/Layout';

import FetchConfig from './layouts/fetch-config';
import Search from './layouts/search';

const App: React.FC = () => {
  return (
    <Box width="100%" marginLeft={1} paddingRight={4}>
      <LayoutWrapper initialLayout={FETCH_CONFIG_LAYOUT}>
        <Layout layoutName={FETCH_CONFIG_LAYOUT}>
          <FetchConfig />
        </Layout>

        <Layout layoutName={SEARCH_LAYOUT}>
          <Search />
        </Layout>
      </LayoutWrapper>
    </Box>
  );
};

export default App;
