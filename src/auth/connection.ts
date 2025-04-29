import jsforce from 'jsforce';
import { execSync } from 'child_process';

export enum ConnectionType {
  OAuth_2_0_Client_Credentials = 'OAuth_2.0_Client_Credentials', // Requires SALESFORCE_CLIENT_ID and SALESFORCE_CLIENT_SECRET
  VS_Code_SFDX = 'VS_Code_SFDX', // Requires default Salesforce org set in VS Code
}

/**
 * Creates a Salesforce connection using either username/password or OAuth 2.0 Client Credentials Flow
 * @param config Optional connection configuration
 * @returns Connected jsforce Connection instance
 */
export async function createSalesforceConnection(options?: { connection_type?: ConnectionType; instance_url?: string }) {
  const connectionType = options?.connection_type ?? (process.env.SALESFORCE_CONNECTION_TYPE as ConnectionType) ?? ConnectionType.VS_Code_SFDX;
  const loginUrl = options?.instance_url ?? process.env.SALESFORCE_INSTANCE_URL ?? 'https://login.salesforce.com';

  try {
    switch (connectionType) {
      case ConnectionType.OAuth_2_0_Client_Credentials:
        console.error('Connecting to Salesforce using the OAuth2 Client Credentials flow');

        const clientId = process.env.SALESFORCE_CLIENT_ID;
        const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

        return new jsforce.Connection({
          instanceUrl: loginUrl,
          oauth2: {
            clientId: process.env.SALESFORCE_CLIENT_ID,
            clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
            loginUrl,
          },
        });

      case ConnectionType.VS_Code_SFDX:
        console.error('Connecting to Salesforce using VS Code SFDX token');

        // const sfdxOrgInfo = JSON.parse(execSync('/usr/local/bin/sf force org display --json 2>/dev/null').toString());
        // if (!sfdxOrgInfo.result) {
        //   throw new Error(`No default SFDX org found. Please authorize an org using SFDX first : ${sfdxOrgInfo.stdio instanceof Buffer ? sfdxOrgInfo.stdio.toString() : sfdxOrgInfo.stdio}`);
        // }
        // const { instanceUrl, accessToken } = sfdxOrgInfo.result;

        const { instanceUrl, accessToken } = {
          accessToken: '00DgL000002SL0M!AQEAQCGFX9lU.p2SHMX7vsb_oSpoKacodvRKJR8BVGievBnUiHxeQblWhybRrmXk7MtTivFe8_QMuVQm.G9TTQCJxH1lY2uL',
          instanceUrl: 'https://orgfarm-9ae6a484e9-dev-ed.develop.my.salesforce.com',
        };

        return new jsforce.Connection({
          instanceUrl: instanceUrl,
          accessToken: accessToken,
        });
    }
  } catch (error) {
    console.error('Error connecting to Salesforce:', error);
    throw error;
  }
}
