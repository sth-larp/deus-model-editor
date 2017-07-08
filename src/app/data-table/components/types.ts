import { DataTableRow } from './row.component';
import { DataTableColumn } from './column.component';
import { DataTableTranslations } from './Interfaces/DataTableTranslations';

// export type HeaderCallback = (column: DataTableColumn) => string;


export var defaultTranslations = <DataTableTranslations>{
    indexColumn: 'index',
    selectColumn: 'select',
    expandColumn: 'expand',
    paginationLimit: 'Limit',
    paginationRange: 'Results'
};


export interface DataTableParams {
    offset?: number;
    limit?: number;
    sortBy?: string;
    sortAsc?: boolean;
}
