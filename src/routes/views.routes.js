import { Router } from "express";
// import passportCall from "../passportJwt/passportCall.js";
import ViewsController from "../controllers/views.controller.js";
import authorization from "../passportJwt/authorization.js";
import { productService, cartService } from "../services/services.js";

// const passportCall = passportCallModule.passportCall;
// const passportCallUrl = passportCallModule.passportCallUrl;

const viewsController = new ViewsController(cartService, productService);
const viewsRouter = Router();

viewsRouter.get("/products", viewsController.renderProducts);
viewsRouter.get("/realtimeproducts", viewsController.renderRealTime);
viewsRouter.get("/chat", authorization("user"), viewsController.renderChat);
viewsRouter.get("/", viewsController.renderHome);
viewsRouter.get("/login", viewsController.renderLogin);
viewsRouter.get("/signup", viewsController.renderSignup);
viewsRouter.get("/logout", viewsController.renderLogout);
viewsRouter.get("/tickets", viewsController.renderTickets);

export default viewsRouter;
