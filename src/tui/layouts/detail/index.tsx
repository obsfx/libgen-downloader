import React from "react";
import ContentContainer from "../../components/ContentContainer";
import { useAppContext } from "../../contexts/AppContext";
import DetailRow from "./DetailRow";

const Detail: React.FC = () => {
  const { detailedEntry } = useAppContext();

  if (!detailedEntry) {
    return null;
  }

  return (
    <ContentContainer>
      {Object.entries(detailedEntry)
        .filter(([key]) => key !== "downloadUrls")
        .map(([key, value], idx) => (
          <DetailRow
            key={idx}
            label={key === "id" ? key.toUpperCase() : `${key[0].toUpperCase()}${key.slice(1)}`}
            description={value}
          />
        ))}
    </ContentContainer>
  );
};

export default Detail;
