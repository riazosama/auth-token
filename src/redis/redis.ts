import * as redis from 'redis';
import { promisify } from 'util';

export class Redis {
  private client!: redis.RedisClient;
  private isConnected = false;
  private asyncHget: any;

  /**
   * This will try to connect with Redis Server
   */
  public connect() {
    return new Promise((resolve, reject) => {
      this.client = redis.createClient();
      this.asyncHget = promisify(this.client.hget).bind(this.client);
      this.client.on('connect', () => {
        this.isConnected = true;
        resolve({ redis: this.isConnected });
      });

      this.client.on('error', err => {
        reject({ redis: this.isConnected, err });
      });
    });
  }

  /**
   * Check is the connection to Redis server has been established or not.
   * If not, then establish the connection.
   */
  private async checkConnection() {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  /**
   * Save the data for a specific user.
   *
   * @param userId string | number
   * @param data any
   */
  public async save(userId: string | number, data: any) {
    if (typeof userId === 'number') {
      userId = String(userId);
    }
    await this.checkConnection();
    this.client.hmset(userId, 'data', JSON.stringify(data), redis.print);
  }

  /**
   * Retrives the data for a specific user
   *
   * @param userId string | number
   */
  public async get(userId: string | number) {
    if (typeof userId === 'number') {
      userId = String(userId);
    }

    await this.checkConnection();
    return await this.asyncHget(userId, 'data');
  }
}
