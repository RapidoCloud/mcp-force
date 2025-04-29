const BASE_URL = '/services/data/v59.0/einstein/platform';

const modelName = 'sfdc_ai__DefaultBedrockAnthropicClaude3Haiku';

export async function listModels(conn: any): Promise<any> {
  const response = await conn.request({
    method: 'GET',
    url: BASE_URL,
  });
  return response;
}

export async function generateText(conn: any, params: any): Promise<any> {
  params.modelName = modelName;

  const response = await conn.request({
    method: 'POST',
    url: `${BASE_URL}/models/${params.model}/generations`,
    body: JSON.stringify({
      prompt: params.prompt,
      ...params.parameters,
    }),
    headers: {
      'x-sfdc-app-context': 'EinsteinGPT',
      'x-client-feature-id': 'ai-platform-models-connected-app',
      'content-type': 'application/json;charset=utf-8',
    },
  });
  return response;
}

export async function generateChat(conn: any, params: any): Promise<any> {
  const response = await conn.request({
    method: 'POST',
    url: `${BASE_URL}/einstein-gpt/chat/completions`,
    body: {
      model: modelName,
      messages: params.messages,
      temperature: params.parameters?.temperature || 0.7,
      max_tokens: params.parameters?.max_tokens || 500,
      user_context: {
        org_id: conn.userInfo.organizationId,
        user_id: conn.userInfo.id,
      },
    },
    headers: {
      'Content-Type': 'application/json',
      'x-sfdc-app-context': 'EinsteinGPT',
      'x-client-feature-id': 'ai-platform-models-connected-app',
    },
  });
  return response;
}
