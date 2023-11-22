import { Router } from "express";
import ProductController from "../controllers/products.controllers.js";
import { authorization, passportCall } from "../utils.js";

const productsRouter = Router();
const productController = new ProductController();

productsRouter.get("/", productController.getProducts);


productsRouter.get("/:pid", productController.getProductById);


productsRouter.post("/",passportCall('jwt'), authorization(['admin', 'premium']), productController.addProducts);


productsRouter.put("/:pid",passportCall('jwt'), authorization(['admin']), productController.updateProduct);


productsRouter.delete("/:pid",passportCall('jwt'), authorization(['admin', 'premium']), productController.deleteProduct);

export default productsRouter;