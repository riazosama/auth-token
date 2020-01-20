import IControllerBase from "../interfaces/IControllerBase.interface";
import { Router, Request, Response } from "express";
import { authToken } from "auth-token-express";
import { accounts } from "../accounts";

class AuthController implements IControllerBase {
    public router = Router();

    constructor() {
        this.initRoutes();
    }

    initRoutes() {
        this.router.post("/login", this.login);
        this.router.post("/profile", this.getUserProfile);
        this.router.post("/refresh", this.refreshToken);
        this.router.post("/logout", this.logout);
    }

    async login(req: Request | any, res: Response) {
        let payload: any;
        let tokens: any = [];

        const { username } = req.body;

        const userAccount = accounts.find(account => account.username === username);

        if (userAccount) {
            payload = [{ email: userAccount.email }, { email: userAccount.email }];
            tokens = await authToken.createTokens(userAccount.id, payload, {
                device: req.headers["user-agent"]
            });
        }
        res.json({ tokens, userAccount });
    }

    async getUserProfile(req: Request, res: Response) {
        const { accessToken } = req.body;
        try {
            const decoded: any = authToken.verify(accessToken, "access");
            const userAccount = accounts.find(
                account => account.email === decoded.email
            );
            if (userAccount) {
                res.json(userAccount);
            }
        } catch (e) {
            res.json("Invalid Token");
        }
    }

    async refreshToken(req: Request, res: Response) {
        const { username, refreshToken } = req.body;
        const userAccount = accounts.find(account => account.username === username);

        if (userAccount) {
            const payload = [{ email: userAccount.email }, { email: userAccount.email }];
            try {

                const tokens = await authToken.refreshToken(userAccount.id, refreshToken, payload, {
                    device: req.headers["user-agent"]
                });
                res.json({ tokens });

            } catch (e) {
                res.json("No such refresh token found")
            }
        }

    }

    async logout(req: Request, res: Response) {
        const { accessToken } = req.body;

        const decoded: any = authToken.verify(accessToken, "access");

        const userAccount = accounts.find(
            account => account.email === decoded.email
        );

        if (userAccount) {
            await authToken.removeTokenForDevice(
                userAccount.id,
                req.headers["user-agent"]
            );
            res.json({ logout: "success" });
        }
    }
}

export default AuthController;
