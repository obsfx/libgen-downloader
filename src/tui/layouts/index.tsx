import React from "react";
import { Layout } from "./Layout";
import { LAYOUT_KEY } from "./keys";
import Search from "./search/index";
import ResultList from "./result-list/index";
import { ResultListContextProvider } from "../contexts/ResultListContext";
import Detail from "./detail/index";
import { BulkDownload } from "./bulk-download/index";
import { BulkDownloadBeforeExit } from "./bulk-download-before-exit/index";
import { DownloadQueueBeforeExit } from "./download-queue-before-exit/index";

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

      <Layout layoutName={LAYOUT_KEY.BULK_DOWNLOAD_LAYOUT}>
        <BulkDownload />
      </Layout>

      <Layout layoutName={LAYOUT_KEY.BULK_DOWNLOAD_BEFORE_EXIT_LAYOUT}>
        <BulkDownloadBeforeExit />
      </Layout>

      <Layout layoutName={LAYOUT_KEY.DOWNLOAD_QUEUE_BEFORE_EXIT_LAYOUT}>
        <DownloadQueueBeforeExit />
      </Layout>
    </>
  );
};

export default Layouts;
