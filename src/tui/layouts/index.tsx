import React from "react";
import { Layout } from "./Layout";
import { LAYOUT_KEY } from "./keys";
import Search from "./search";
import ResultList from "./result-list";
import { ResultListContextProvider } from "../contexts/ResultListContext";
import Detail from "./detail";

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
