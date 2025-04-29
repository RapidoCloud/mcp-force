export async function rest_api_query(conn: any, params: any): Promise<any> {
  return conn.query(params.query);
}

export async function rest_api_search(conn: any, params: any): Promise<any> {
  return conn.search(params.query);
}

export async function rest_api_retrieve(conn: any, params: any): Promise<any> {
  return conn.sobject(params.objectName).retrieve(params.recordId);
}
