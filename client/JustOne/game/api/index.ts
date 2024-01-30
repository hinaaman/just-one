export class Api {
  private baseUrl: string;
  private paths: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.paths = {
      getDeck: "/api/mystery-words",
      getHint: "/api/hint",
      getGuess: "/api/guess",
      getAudit: "/api/audit",
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  private async fetchJson(path: string, params?: URLSearchParams) {
    try {
      const url = params
        ? `${this.baseUrl}${path}?${params}`
        : `${this.baseUrl}${path}`;
      const response = await fetch(url);
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Request failed: ${error}`);
    }
  }

  async getDeck() {
    const response = await this.fetchJson(this.paths.getDeck);
    return response.data;
  }

  async getHint(word: string, person: string) {
    const params = new URLSearchParams({
      word,
      person,
    });
    const response = await this.fetchJson(this.paths.getHint, params);
    console.log(`${person}'s hint: ${response.data}`);
    return response.data;
  }

  async getAudit(hints: string) {
    const params = new URLSearchParams({
      hints,
    });
    const response = await this.fetchJson(this.paths.getAudit, params);
    return response.data;
  }

  async getGuess(hints: string, person: string) {
    const params = new URLSearchParams({
      hints,
      person,
    });
    const response = await this.fetchJson(this.paths.getGuess, params);
    return response.data;
  }
}
