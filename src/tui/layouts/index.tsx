import React from "react";
import { RESULT_LIST_LAYOUT, SEARCH_LAYOUT, DETAIL_LAYOUT } from "../../constants";
import { Layout } from "./Layout";
import Search from "./search";
import ResultList from "./result-list";
import { ResultListContextProvider } from "../contexts/ResultListContext";
import Detail from "./detail";

const Layouts: React.FC = () => {
  return (
    <>
      <Layout layoutName={SEARCH_LAYOUT}>
        <Search />
      </Layout>

      <Layout layoutName={RESULT_LIST_LAYOUT}>
        <ResultListContextProvider>
          <ResultList />
        </ResultListContextProvider>
      </Layout>

      <Layout layoutName={DETAIL_LAYOUT}>
        <Detail />
      </Layout>
    </>
  );
};

export default Layouts;
