export interface PostmanWorkspace {
  id: string;
  name: string;
  type: "personal" | "team" | "private" | "public";
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostmanCollection {
  id: string;
  name: string;
  uid: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  fork?: {
    label: string;
    createdAt: string;
    from: string;
  };
}

export interface PostmanCollectionDetail {
  info: {
    _postman_id: string;
    name: string;
    description?: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
}

export interface PostmanItem {
  name: string;
  id?: string;
  request?: PostmanRequest;
  response?: PostmanResponse[];
  item?: PostmanItem[];
}

export interface PostmanRequest {
  method: string;
  header?: PostmanHeader[];
  body?: {
    mode: string;
    raw?: string;
    formdata?: { key: string; value: string; type: string }[];
  };
  url: {
    raw: string;
    protocol?: string;
    host?: string[];
    path?: string[];
    query?: { key: string; value: string }[];
  };
  description?: string;
}

export interface PostmanResponse {
  name: string;
  status: string;
  code: number;
  body?: string;
  header?: PostmanHeader[];
}

export interface PostmanHeader {
  key: string;
  value: string;
  description?: string;
}

export interface PostmanVariable {
  key: string;
  value: string;
  type?: string;
}

export interface PostmanEnvironment {
  id: string;
  name: string;
  uid: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostmanEnvironmentDetail {
  id: string;
  name: string;
  values: PostmanVariable[];
}

export interface PostmanApiResponse<T> {
  data: T | null;
  error: string | null;
}
