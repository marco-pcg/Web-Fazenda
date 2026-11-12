export type FieldValue = string | number | boolean | string[];
export type FieldValues = Record<string, FieldValue>;
export type FieldDefinition = {
  name: string;
  label: string;
  kind:
    | "text"
    | "email"
    | "password"
    | "number"
    | "boolean"
    | "date"
    | "array"
    | "select";
  required: boolean;
  description?: string;
  options?: (string | number)[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number | "any";
  format?: "uuid";
};
export type EndpointDefinition = {
  id: string;
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  route: string;
  title: string;
  permission: string | null;
  authenticated: boolean;
  body: FieldDefinition[];
  query: FieldDefinition[];
  params: FieldDefinition[];
  bodyDto?: string;
  queryDto?: string;
  source: string;
};
export type ResourceDefinition = {
  key: string;
  title: string;
  endpoints: EndpointDefinition[];
};
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type PaginatedResponse<T> = { data: T[]; meta: PaginationMeta };
