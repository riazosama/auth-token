# auth-token
Authentication package for handling access tokens and refresh token

## Requirements

 - [Redis](#[https://redis.io/](https://redis.io/))

## Installation
Using `NPM`

    npm i auth-token-express
In Node.js:

    import {authToken} from 'auth-token-express';
    or
    const authToken = require('auth-token-express').authToken;

## Example

    git clone git@github.com:<<username>>/auth-token.git
    cd example
    npm install
    npm run dev

## Why auth-token
Auth-token makes authentication relatively an easy process. You don't need to worry about access_token / refresh_token creation. This package depends upon `redis` to manage and store refresh_tokens. This package is great for:

 - Creatiing `accessToken` and `refreshTokens`
 - Verifying `JSONWebTokens`
 - Refreshing `accessTokens` using `refreshToken`

## API Reference
### `initilize:void`
This method will initilize the package. The best place to use this method would be in the starting file of your application e.g `app.js`;

#### Parameters
| Parameter | Type | Description |
|--|--|--|
| secretOrPrivateKey  | [Secret[]](#secret)  | Key used to generate JWT |
| options | [SignOptions[]](#signoptions) | Additional options required to generate JWT


### `createTokens:Promise<{accessToken: string, refreshToken: string}>`
Will create `accessToken` and `refreshToken` based on the secret or private key passed in the [initilize](#initilize) method. The `refreshToken` will saved in `redis` server against the `userId`

| Parameter | Type | Description |
|--|--|--|
|userId| `string`,<br>`number`| Id of the user for which you want to save `refreshToken`
|payload|`string`,<br>`Buffer`,<br>`object`| All additional information which you want to store within both tokens
|data|[IData](#idata)| All additional information which you want to store in redis in addition to your `refreshToken` against `userId`

### `removeAllToken:Promise<boolean>`
This will remove all `refreshTokens` of a specific user. Best use case to use this method will be when you observe some abnormal behavior for an account and want to logout the user from all the devices.
| Parameter | Type | Description |
|--|--|--|
|userId|`string`,<br>`number`|UserId against which you want to delete all data stored in redis.

### `removeTokenForDevice:Promise<boolean>`
Will remove a `refreshToken` for a specifc user against a specific device. Should be used when a user logsout from a singlr device.
| Parameter | Type | Description |
|--|--|--|
|userId|`string`,<br>`number`|UserId against which you want to delete data stored in redis.
|device|`string`|`user-agent`'s name against which you want to delete data stored in redis

### `verify:string | object`
Checks if a JWT token is valid or not
| Parameter | Type | Description |
|--|--|--|
|token|`string`|Token which needs to be verified
|type|`'access'`,<br>`'refresh'`|Type of token which needs to be verified. Deafult is `'access'`

### `refreshToken:Promise<{accessToken: string, refreshToken: string}>`
This method should be used when you want to refresh you `accessToken`
| Parameter | Type | Description |
|--|--|--|
|userId|`string`,<br>`number`|Id of user used to fetch data from redis
|refreshToken|`string`|Token which will be validated and used to create new tokens
|payload|`string`,<br>`Buffer`,<br>`object`|All additional information which you want to store within both tokens
|data|[IData](#idata)| All additional information which you want to store in redis in addition to your `refreshToken` against `userId`

## Interfaces

### Secret
|Property|Description| Type(s)|
|--|--|--|
| Secret | Array of secrets with which you want to create and verify tokens. Value at `index 0` will be used as a secret for `accessToken` and value at `index 1` will be used for `refreshToken`  | `string`,<br>`Buffer`,<br>`{ key: string | Buffer; passphrase: string };`


### SignOptions

|Property|Description| Type(s)|
|--|--|--|
|algorithm?||`Algorithm`
|keyid?||`string`
|expiresIn?|expressed in seconds or a string describing a time span 	[zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", 	"7d"| `string`,<br>`number`
|notBefore?|expressed in seconds or a string describing a time span 	[zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", 	"7d"| `string`,<br>`number`
|audience?|| `string`,<br>`string[]`
|subject?|| `string`
|issuer?|| `string`
|jwtid?|| `string`
|mutatePayload?||`boolean`
|noTimestamp?||`boolean`
|header?||`object`
|encoding?||`string`

### IData
|Property|Description| Type(s)|
|--|--|--|
|device|`User-Agent` from which API was consumed. This is required so that when someone logout from a specific device/browser, we could remove that data (`refreshToken`) from redis associated with a specific `user-agent` (Consult to `Example` to see usage)| `string`
|refreshToken?||`string`