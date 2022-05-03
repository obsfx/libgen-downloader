import React, { useMemo } from 'react';

import ExpandableSection from '../../../components/ExpandableSection';
import FilterInput from './FilterInput';
import { FilterInputs } from './Filter.data';

const SearchFilter: React.FC = ({}) => {
  const renderInputs = useMemo(() => {
    return FilterInputs.map(({ label, key }, idx) => (
      <FilterInput key={idx} label={label} filterKey={key} />
    ));
  }, []);

  return (
    <ExpandableSection showText="Show Filters" hideText="Hide Filters">
      {renderInputs}
    </ExpandableSection>
  );
};

export default SearchFilter;
