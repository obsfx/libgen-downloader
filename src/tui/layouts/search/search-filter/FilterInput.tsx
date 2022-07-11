import React, { useCallback } from "react";
import { useFocus } from "ink";

import Input from "../../../components/Input";
import { useAppContext } from "../../../contexts/AppContext";
import { FilterKey } from "./Filter.data";

const FilterInput: React.FC<{
  label: string;
  filterKey: FilterKey;
}> = ({ label, filterKey }) => {
  const { filters, setFilters } = useAppContext();

  const { isFocused } = useFocus({ autoFocus: true });

  const handleInputChange = useCallback(
    (val: string) => {
      setFilters({
        ...filters,
        [filterKey]: val,
      });
    },
    [filters, filterKey, setFilters]
  );

  return (
    <Input
      label={label}
      placeholder=""
      isFocused={isFocused}
      searchValue={filters[filterKey] || ""}
      onSearchValueChange={handleInputChange}
    />
  );
};

export default FilterInput;
