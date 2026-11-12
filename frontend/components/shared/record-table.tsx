import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Column<T> = {
  key: string;
  label: string;
  render: (record: T) => ReactNode;
};
export function RecordTable<T>({
  records,
  columns,
  getKey,
}: {
  records: T[];
  columns: Column<T>[];
  getKey: (record: T) => string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key}>{column.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={getKey(record)}>
            {columns.map((column) => (
              <TableCell key={column.key}>{column.render(record)}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
