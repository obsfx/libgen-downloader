import React from 'react';
import { Text } from 'ink';

const SearchInfo: React.FC = () => {
  return (
    <Text>
      <Text color="yellowBright">[TAB]</Text> to switch between 'Search Input' and 'Show Filters',
      <Text color="yellowBright"> [ENTER]</Text> to Search
    </Text>
  );
};

export default SearchInfo;
