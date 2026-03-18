import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import React, { useMemo, useState } from "react";

export type Column<RowType> = {
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  render: (row: RowType) => React.ReactNode;
  key?: string | number;
  sortable?: boolean;
  accessor?: (row: RowType) => string | number | Date | null | undefined;
};

export default function BasicTable<RowType>({
  rows = [] as RowType[],
  columns = [] as Column<RowType>[],
  getRowKey,
  selectable = false,
  multiSelect = true,
  onSelectionChange,
  selectedKeys: selectedKeysProp,
}: {
  rows?: RowType[];
  columns?: Column<RowType>[];
  getRowKey?: (row: RowType) => React.Key;
  selectable?: boolean;
  multiSelect?: boolean;
  selectedKeys?: React.Key[];
  onSelectionChange?: (selected: RowType[]) => void;
}) {
  const [orderBy, setOrderBy] = useState<string | number | undefined>(undefined);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<React.Key[]>([]);
  const selectedKeys = selectedKeysProp ?? internalSelectedKeys;

  const handleSort = (colKey: string | number, col: Column<RowType>) => {
    if (!col.sortable) return;
    const key = colKey;
    if (orderBy === key) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (orderBy === undefined) return rows;
    const colIndex = columns.findIndex((c, i) => (c.key ?? i) === orderBy);
    if (colIndex === -1) return rows;
    const col = columns[colIndex];
    if (!col.sortable || !col.accessor) return rows;
    const accessor = col.accessor;
    const sorted = [...rows].sort((a, b) => {
      const av = accessor(a);
      const bv = accessor(b);
      if (av == null && bv == null) return 0;
      if (av == null) return -1;
      if (bv == null) return 1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      if (av instanceof Date && bv instanceof Date) return av.getTime() - bv.getTime();
      return String(av).localeCompare(String(bv));
    });
    if (order === "desc") sorted.reverse();
    return sorted;
  }, [rows, columns, orderBy, order]);

  const rowKeyFor = (row: RowType, index: number) => (getRowKey ? getRowKey(row) : index);

  const notifySelection = (keys: React.Key[]) => {
    if (selectedKeysProp === undefined) setInternalSelectedKeys(keys);
    if (onSelectionChange) {
      const selectedRows = keys
        .map((k) => {
          const idx = sortedRows.findIndex((r, i) => String(rowKeyFor(r, i)) === String(k));
          return idx === -1 ? null : sortedRows[idx];
        })
        .filter(Boolean) as RowType[];
      onSelectionChange(selectedRows);
    }
  };

  const toggleKey = (key: React.Key) => {
    if (!multiSelect) {
      const newKeys = selectedKeys && selectedKeys[0] === key ? [] : [key];
      notifySelection(newKeys);
      return;
    }
    const exists = selectedKeys?.some((k) => String(k) === String(key));
    const newKeys = exists ? selectedKeys.filter((k) => String(k) !== String(key)) : [...(selectedKeys ?? []), key];
    notifySelection(newKeys);
  };

  const toggleSelectAll = () => {
    if (!multiSelect) return;
    const allKeys = sortedRows.map((r, i) => rowKeyFor(r, i));
    const allSelected = selectedKeys && allKeys.every((k) => selectedKeys.includes(k));
    notifySelection(allSelected ? [] : allKeys);
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                  {multiSelect ? (
                  <Checkbox
                    indeterminate={
                      selectedKeys && selectedKeys.length > 0 && selectedKeys.length < sortedRows.length
                    }
                    checked={selectedKeys && sortedRows.length > 0 && selectedKeys.length === sortedRows.length}
                    onChange={toggleSelectAll}
                    slotProps={{ input: { "aria-label": "select all" } }}
                  />
                ) : null}
              </TableCell>
            )}
            {columns.map((col, i) => {
              const key = col.key ?? i;
              return (
                <TableCell key={String(key)} align={col.align ?? "left"}>
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === key}
                      direction={orderBy === key ? order : "asc"}
                      onClick={() => handleSort(key, col)}
                    >
                      {col.header}
                    </TableSortLabel>
                  ) : (
                    col.header
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row, rowIndex) => {
            const key = rowKeyFor(row, rowIndex);
            const isSelected = !!selectedKeys?.some((k) => String(k) === String(key));
            return (
              <TableRow
                key={String(key)}
                selected={isSelected}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleKey(key)}
                      slotProps={{ input: { "aria-label": `select-row-${String(key)}` } }}
                    />
                  </TableCell>
                )}
                {columns.map((col, ci) => (
                  <TableCell key={String(col.key ?? ci)} align={col.align ?? "left"}>
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
