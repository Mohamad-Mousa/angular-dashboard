import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { StatusPillComponent, PillTone } from '../pill/pill';
import { LoaderComponent } from '../loader/loader';

export interface TableColumn {
  label: string;
  key: string;
  type?: 'text' | 'badge';
  badgeClassKey?: string;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?:
    | Array<{ label: string; value: string }>
    | string[];
  sortable?: boolean;
}

type ActionKey = 'canRead' | 'canEdit' | 'canDelete';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, StatusPillComponent, LoaderComponent],
  templateUrl: './table.html',
  styleUrl: './table.scss',
})
export class TableComponent {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) rows: Array<Record<string, unknown>> = [];
  @Input() emptyMessage = 'No data available';
  @Input() showActions = false;
  @Input() enableFilters = false;
  @Input() enableSorting = false;
  @Input() enableGlobalSearch = true;
  @Input() loading = false;
  @Input() loadingLabel = 'Loading data...';
  protected openRowIndex: number | null = null;
  protected filters: Record<string, string> = {};
  protected sortColumn?: string;
  protected sortDirection: 'asc' | 'desc' = 'asc';
  protected globalSearch = '';

  protected readonly actionKeys: ActionKey[] = [
    'canRead',
    'canEdit',
    'canDelete',
  ];

  protected readonly actionLabels: Record<ActionKey, string> = {
    canRead: 'Read',
    canEdit: 'Edit',
    canDelete: 'Delete',
  };
  protected readonly actionIcons: Record<ActionKey, string> = {
    canRead: 'visibility',
    canEdit: 'edit',
    canDelete: 'delete',
  };

  protected badgeClassFor(
    row: Record<string, unknown>,
    column: TableColumn,
  ): PillTone {
    if (column.badgeClassKey) {
      const value = row[column.badgeClassKey];
      if (typeof value === 'string') {
        return this.mapTone(value);
      }
    }

    return 'neutral';
  }

  protected actionBadgeClass(row: Record<string, unknown>, key: ActionKey) {
    return this.actionEnabled(row, key)
      ? 'bg-primary-subtle text-primary-emphasis'
      : 'bg-light text-muted border';
  }

  protected actionEnabled(row: Record<string, unknown>, key: ActionKey): boolean {
    return Boolean(row[key]);
  }

  protected toggleActions(index: number): void {
    this.openRowIndex = this.openRowIndex === index ? null : index;
  }

  protected onFilterChange(columnKey: string, value: string): void {
    this.filters = {
      ...this.filters,
      [columnKey]: value,
    };
  }

  protected filterValue(columnKey: string): string {
    return this.filters[columnKey] ?? '';
  }

  protected toggleSort(column: TableColumn): void {
    if (!this.enableSorting || column.sortable === false) return;
    const key = column.key;
    if (this.sortColumn === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = key;
      this.sortDirection = 'asc';
    }
  }

  protected clearSort(): void {
    this.sortColumn = undefined;
  }

  protected onGlobalSearchChange(value: string): void {
    this.globalSearch = value;
  }

  protected get processedRows(): Array<Record<string, unknown>> {
    let data = [...this.rows];

    if (this.enableFilters && this.enableGlobalSearch) {
      const query = this.globalSearch.trim().toLowerCase();
      if (query) {
        data = data.filter((row) =>
          this.columns.some((column) =>
            String(row[column.key] ?? '').toLowerCase().includes(query),
          ),
        );
      }
    }

    if (this.enableFilters) {
      for (const column of this.columns) {
        if (!column.filterable || !this.filters[column.key]) continue;
        const filterValue = this.filters[column.key].toLowerCase().trim();
        if (!filterValue) continue;
        data = data.filter((row) => {
          const cell = row[column.key];
          return String(cell ?? '')
            .toLowerCase()
            .includes(filterValue);
        });
      }
    }

    if (this.enableSorting && this.sortColumn) {
      const column = this.columns.find((col) => col.key === this.sortColumn);
      if (column) {
        const direction = this.sortDirection === 'asc' ? 1 : -1;
        data = [...data].sort((a, b) => {
          const valueA = a[column.key];
          const valueB = b[column.key];
          if (valueA == null && valueB == null) return 0;
          if (valueA == null) return -direction;
          if (valueB == null) return direction;
          return String(valueA).localeCompare(String(valueB)) * direction;
        });
      }
    }

    return data;
  }

  @HostListener('document:click')
  protected closeActions(): void {
    this.openRowIndex = null;
  }

  protected cellLabel(row: Record<string, unknown>, column: TableColumn): string {
    const value = row[column.key];
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  private mapTone(value: string): PillTone {
    const normalized = value.toLowerCase();
    if (normalized.includes('active') || normalized.includes('success')) {
      return 'success';
    }
    if (normalized.includes('pending') || normalized.includes('warning')) {
      return 'warning';
    }
    if (normalized.includes('error') || normalized.includes('danger')) {
      return 'danger';
    }
    if (normalized.includes('info')) {
      return 'info';
    }
    return 'neutral';
  }
}

