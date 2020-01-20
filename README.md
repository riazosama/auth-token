# auth-token
Authentication package for handling access tokens and refresh token

## Installation
Using `NPM`

    npm i auth-token-express
In Node.js:

    import {authToken} from 'auth-token-express';

## Example

    git clone git@github.com:riazosama/auth-token.git
    cd example
    npm install
    npm run dev

## Why auth-token
Auth-token makes authentication relatively an easy process. You don't need to worry about access_token / refresh_token creation. This package depends upon `redis` to manage and store refresh_tokens. This package is great for:

 - Creatiing `accessToken` and `refreshTokens`
 - Verifying `JSONWebTokens`
 - Refreshing `accessTokens` using `refreshToken`

## API Reference
### `initilize`
This method will initilize the package. The best place to use this method would be in the starting file of your application e.g `app.js`;

#### Parameters
| Parameter | Type | Description |
|--|--|--|
| secretOrPrivateKey  | [Secret[]](#secret)  | Key used to generate JWT |
| options | [SignOptions[]](#signoptions) | Additional options required to generate JWT


### `createTokens`
Will create `accessToken` and `refreshToken` based on the secret or private key passed in the [initilize](#initilize) method. The `refreshToken` will saved in `redis` server against the `userId`	

### `removeAllToken`
This will remove all `refreshTokens` of a specific user. Best use case to use this method will be when you observe some abnormal behavior for an account and want to logout the user from all the devices.

### `removeTokenForDevice`
Will remove a `refreshToken` for a specifc user against a specific device. Should be used when a user logsout from a singlr device.

### `verify`
Checks if a JWT token is valid or not

### `refreshToken`
This method should be used when you want to refresh you `accessToken`

## Interfaces

### Secret

    export  type  Secret = string | Buffer | { key: string | Buffer; passphrase: string }

### SignOptions

    export  interface  SignOptions {
    
	    algorithm?: Algorithm;
    
	    keyid?: string;
    
	    /** expressed in seconds or a string describing a time span 	[zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", 	"7d" */
    
	    expiresIn?: string | number;
    
	    /** expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js). Eg: 60, "2 days", "10h", "7d" */
    
	    notBefore?: string | number;
    
	    audience?: string | string[];
	    
	    subject?: string;
    
	    issuer?: string;
    
	    jwtid?: string;
    
	    mutatePayload?: boolean;
    
	    noTimestamp?: boolean;
    
	    header?: object;
    
	    encoding?: string;
    
    }
