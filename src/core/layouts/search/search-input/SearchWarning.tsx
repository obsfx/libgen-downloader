import React, { useContext } from 'react';
import { Text } from 'ink';

import { IAppContext, AppContext } from '../../../AppContext';
import { SEARCH_MIN_CHAR } from '../../../../constants/options';

const SearchWarning: React.FC = () => {
  const { showSearchMinCharWarning } = useContext(AppContext) as IAppContext;

  if (!showSearchMinCharWarning) {
    return null;
  }

  return (
    <Text color="yellow" wrap="truncate">
      Search string must contain minimum {SEARCH_MIN_CHAR} characters.
    </Text>
  );
};

export default SearchWarning;
