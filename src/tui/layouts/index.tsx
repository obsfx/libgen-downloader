import React from "react";

import { RESULT_LIST_LAYOUT, SEARCH_LAYOUT } from "../../constants/layouts";
import { LayoutWrapper, Layout } from "./Layout";
import Search from "./search";
import ResultList from "./result-list";

const Layouts: React.FC = () => {
  return (
    <LayoutWrapper initialLayout={SEARCH_LAYOUT}>
      <Layout layoutName={SEARCH_LAYOUT}>
        <Search />
      </Layout>

      <Layout layoutName={RESULT_LIST_LAYOUT} dontUnMountOnHide>
        <ResultList />
      </Layout>
    </LayoutWrapper>
  );
};

export default Layouts;
