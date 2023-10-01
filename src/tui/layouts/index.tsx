import React from "react";
import { Layout } from "./Layout.js";
import { LAYOUT_KEY } from "./keys.js";
import Search from "./search/index.js";
import ResultList from "./result-list/index.js";
import { ResultListContextProvider } from "../contexts/ResultListContext.js";
import Detail from "./detail/index.js";
import { BulkDownload } from "./bulk-download/index.js";
import { BulkDownloadBeforeExit } from "./bulk-download-before-exit/index.js";
import { DownloadQueueBeforeExit } from "./download-queue-before-exit/index.js";

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
