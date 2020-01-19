import Redis from '../redis';
import { sign, verify, SignOptions, Secret } from 'jsonwebtoken';

export interface IJWtOptions {
  payload: string[] | Buffer[] | object[];
}

export interface IData {
  device: string;
  refreshToken?: string;
}

class AuthTokens {

  private secretOrPrivateKey: Secret[] = [];
  private options: SignOptions[] = [];

  /**
   * Establishing a connection to a running Redis Server
   */
  constructor() {
    Redis.connect();
  }

  /**
   * Initilizing the Module
   *
   * @param secretOrPrivateKey Secret[]
   * @param options SignOptions[]
   */
  public initilize(secretOrPrivateKey: Secret[], options: SignOptions[]) {
    this.secretOrPrivateKey = secretOrPrivateKey;
    this.options = options;
  }

  /**
   * This will create accessToken and refreshToken which is also saved in Redis
   *
   * @param userId string | number
   * @param jwtOptions IJWTOptions
   * @param data any
   */
  public async createTokens(
    userId: string | number,
    jwtOptions: IJWtOptions,
    data: IData,
  ) {

    const { payload } = jwtOptions;

    // throw error if payload is not according to desired length; which is of length 2;
    if (payload.length < 2 || payload.length > 2) {
      throw new Error('Length must be 2');
    }

    const accessToken = sign(payload[0],
      this.secretOrPrivateKey[0],
      this.options[0]);

    const refreshToken = sign(payload[1],
      this.secretOrPrivateKey[1],
      this.options[1]);

    // getting previous refresh tokens of the user, merging them with new ones and saving the
    // merged array into Redis
    const prevValues = JSON.parse(await Redis.get(String(userId)));

    if (prevValues !== null) {
      const newValue = [...prevValues, { ...data, refreshToken }];
      Redis.save(String(userId), newValue);
    } else {
      Redis.save(String(userId), [{ ...data, refreshToken }]);
    }

    return { accessToken, refreshToken };
  }

  /**
   * Finding if the token is present in redis or not
   *
   * @param userId string | number
   * @param token string
   */
  private async findToken(userId: string | number, token: string) {
    const allTokens: IData[] = JSON.parse(await Redis.get(String(userId)));
    return allTokens.find((tk) => tk.refreshToken === token);
  }

  /**
   * Reset all refresh token for a given user
   *
   * @param userId string | number
   */
  public async removeAllToken(userId: string | number) {
    Redis.save(String(userId), []);
    return true;
  }

  /**
   * Will remove refresh token for a specific user against a specific device.
   * Should be used when a user logout from a specific device
   *
   * @param userId string | number
   * @param device string
   */
  public async removeTokenForDevice(userId: string | number, device: string) {
    const allTokens: IData[] = JSON.parse(await Redis.get(String(userId)));
    const filtered = allTokens.filter((tk) => tk.device !== device);
    Redis.save(String(userId), filtered);
    return true;
  }

  /**
   * Verify JWT token
   * @param token string
   * @param secretOrPrivateKey string
   */
  public verify(token: string | undefined, type: 'access' | 'refresh' = 'access') {

    if (!token) {
      throw new Error('token is undefined');
    }

    try {
      return verify(token,
         type === 'access' ? this.secretOrPrivateKey[0] : this.secretOrPrivateKey[1]);
    } catch (err) {
      throw new Error('Invalid Token');
    }
  }

  /**
   * Used to refresh access token
   *
   * @param userId string | number
   * @param refreshToken string
   * @param jwtOptions IJWtOptions
   * @param data IData
   */
  public async refreshToken(
    userId: string | number,
    refreshToken: string,
    jwtOptions: IJWtOptions,
    data: IData) {

    const oldToken = await this.findToken(userId, refreshToken);

    if (!oldToken) {
      throw new Error('No Such Refresh Token Found');
    }

    try {
      this.verify(oldToken?.refreshToken, 'refresh');
    } catch (err) {
      throw new Error('Invalid Refresh Token');
    }

    await this.removeTokenForDevice(userId, data.device);
    return await this.createTokens(userId, jwtOptions, data);

  }
}

export default new AuthTokens();
