import { DataTableRow } from '../row.component';
import { DataTableColumn } from '../column.component';

export type RowCallback = (item: any, row: DataTableRow, index: number) => string;
