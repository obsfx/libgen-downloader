import React from "react";
import { Layout } from "./Layout.js";
import { LAYOUT_KEY } from "./keys.js";
import Search from "./search/index.js";
import ResultList from "./result-list/index.js";
import { ResultListContextProvider } from "../contexts/ResultListContext.js";
import Detail from "./detail/index.js";

const Layouts: React.FC = () => {
  return (
    <>
      <Layout layoutName={LAYOUT_KEY.SEARCH_LAYOUT}>
        <Search />
      </Layout>

      <Layout layoutName={LAYOUT_KEY.RESULT_LIST_LAYOUT}>
        <ResultListContextProvider>
          <ResultList />
        </ResultListContextProvider>
      </Layout>

      <Layout layoutName={LAYOUT_KEY.DETAIL_LAYOUT}>
        <Detail />
      </Layout>
    </>
  );
};

export default Layouts;
