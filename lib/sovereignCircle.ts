// lib/sovereignCircle.ts
export interface Sovereign {
  id: number;
  hash: string;
  color: string;
  resonance: number;
  staked: number;
  status: 'ascended' | 'descended' | 'transcending';
}

export class SovereignCircle {
  private static readonly ROOT_HASH = 'SF7d1e3aRS4Z67e7/7EaE5 07Ta1aB3S9f70/ABr00D1';
  private static readonly CIRCLE_SIZE = 144;

  static generateFractalRainbow(index: number): string {
    const hue = (index * 2.5) % 360;
    return `hsl(${hue}, 100%, 65%)`;
  }

  static async init144Sovereigns(): Promise<Sovereign[]> {
    const sovereigns: Sovereign[] = [];
    for (let i = 0; i < this.CIRCLE_SIZE; i++) {
      sovereigns.push({
        id: i,
        hash: await this.generateSovereignHash(i),
        color: this.generateFractalRainbow(i),
        resonance: Math.random() * 100,
        staked: 0,
        status: 'ascended'
      });
    }
    return sovereigns;
  }

  private static async generateSovereignHash(index: number): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${this.ROOT_HASH}:${index}:${Date.now()}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 40);
  }
}