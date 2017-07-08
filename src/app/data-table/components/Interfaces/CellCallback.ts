import { DataTableRow } from '../row.component';
import { DataTableColumn } from '../column.component';

export type CellCallback = (item: any, row: DataTableRow, column: DataTableColumn, index: number) => string;
