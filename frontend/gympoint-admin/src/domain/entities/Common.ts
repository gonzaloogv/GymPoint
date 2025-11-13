export interface PaginatedResponse<T> {
  data?: T[];
  users?: T[];
  transactions?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}
