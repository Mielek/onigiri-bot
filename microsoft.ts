import * as rp from 'request-promise';

export class MicrosoftAPI {
  private static baseURL = 'https://graph.microsoft.com/v1.0/';

  constructor(private accessToken) {
  }

  static async sendTeamsMessage(webhookURL, title, summary) {
    const webhookPayload = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      'summary': title,
      'themeColor': '0078D7',
      'title': title,
      'text': summary
    };
    const options = {
      method: 'POST',
      uri: webhookURL,
      body: webhookPayload,
      json: true
    };
    let resp = await rp(options);
    console.log('webhook response', resp);
  }

  async getMe() {
    return this.request('me');
  }

  async getTable(workbookPath, table) {
    const workbookId = await this.getFileId(workbookPath);
    const resp = await this.request(`me/drive/items/${workbookId}/workbook/tables/${table}/columns`);
    const numberOfRows = resp.value[0].values.length - 1;
    const result = Array(numberOfRows);
    for (let index = 0; index < numberOfRows; index++) {
      result[index] = {};
    }
    for (let column of resp.value) {
      const columnName = column.name;
      for (let index = 0; index < numberOfRows; index++) {
        result[index][columnName] = column.values[index + 1][0];
      }
    }
    return result;
  }

  async getFileId(filePath) {
    const response = await this.request(`me/drive/root:${filePath}`);
    return response.id;
  }

  async request(path, method = 'GET') {
    const options = {
      method,
      uri: encodeURI(MicrosoftAPI.baseURL + path),
      headers: {
        'Authorization': 'Bearer ' + this.accessToken,
      },
      json: true
    };
    return rp(options);
  }
}