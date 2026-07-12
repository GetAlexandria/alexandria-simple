export interface TableColumn<T> {
  header: string;
  value: (item: T) => string;
}

export function formatTable<T>(items: T[], columns: TableColumn<T>[]): string {
  const widths = columns.map((column) =>
    Math.max(column.header.length, ...items.map((item) => column.value(item).length)),
  );

  return [
    columns.map((column, index) => column.header.padEnd(widths[index]!)).join("  "),
    ...items.map((item) =>
      columns.map((column, index) => column.value(item).padEnd(widths[index]!)).join("  "),
    ),
  ].join("\n");
}
