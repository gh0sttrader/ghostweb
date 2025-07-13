
import type { ColumnConfig } from '@/types';

export function exportToCSV<T>(filename: string, data: T[], columns: ColumnConfig<T>[]) {
    if (!data || data.length === 0) {
        console.error("No data available to export.");
        return;
    }

    const headers = columns.map(col => col.label).join(',');

    const rows = data.map(item => {
        return columns.map(col => {
            let value = item[col.key as keyof T];

            if (col.format) {
                const formattedNode = col.format(value, item);
                if (typeof formattedNode === 'string' || typeof formattedNode === 'number') {
                    value = formattedNode as any;
                } else if (React.isValidElement(formattedNode) && 'children' in formattedNode.props) {
                    value = formattedNode.props.children;
                }
            }

            const stringValue = String(value ?? '').replace(/"/g, '""');
            return `"${stringValue}"`;
        }).join(',');
    }).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}
