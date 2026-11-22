import { Bot, RandomBot } from 'boardgame.io/ai';

export class BotNormal extends Bot {
  private readonly fallback: RandomBot;

  constructor(options: ConstructorParameters<typeof Bot>[0]) {
    super(options);
    this.fallback = new RandomBot(options);
  }

  play(...args: Parameters<Bot['play']>) {
    return this.fallback.play(...args);
  }
}
