import React, { useEffect } from 'react';
import { Text } from 'ink';

import { fetchConfig } from '../../../api/config';

const FetchConfig: React.FC<{}> = ({}) => {
  useEffect(() => {
    const initializeConfig = async () => {
      const config = await fetchConfig((failCount) => {
        console.log(`Failed: ${failCount}`);
      });

      console.log(config);
    };

    initializeConfig();
  }, []);

  return <Text>fetch config</Text>;
};

export default FetchConfig;
