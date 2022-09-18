import React from "react";

import { RESULT_LIST_LAYOUT, SEARCH_LAYOUT } from "../../constants";
import { LayoutWrapper, Layout } from "./Layout";
import Search from "./search";
import ResultList from "./result-list";
import { ResultListContextProvider } from "../contexts/ResultListContext";

const Layouts: React.FC = () => {
  return (
    <LayoutWrapper initialLayout={SEARCH_LAYOUT}>
      <Layout layoutName={SEARCH_LAYOUT}>
        <Search />
      </Layout>

      <Layout layoutName={RESULT_LIST_LAYOUT}>
        <ResultListContextProvider>
          <ResultList />
        </ResultListContextProvider>
      </Layout>
    </LayoutWrapper>
  );
};

export default Layouts;
