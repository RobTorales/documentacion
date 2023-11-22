import ProductService from "../services/product.services.js";
import CustomeError from "../services/error/customeError.js";
import mongoose from "mongoose";
import { productError } from "../services/error/errorMessages/product.error.js";

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  async getProducts(req, res) {
    try {
      const products = await this.productService.getProducts(req.query);
      res.send(products);
    } catch (error) {
      const productErr = new CustomeError({
        name: "Product Fetch Error",
        message: "Error al obtener los productos",
        code:500,
        cause:error.message,
      });
      req.logger.error(productErr);
      res.status(500).send({status:"error", message:"Error al obtener los productos"})
    }
  }

    async getProductById(req, res, next) {
        try {
            const pid = req.params.pid;
            req.logger.info("Product ID:", pid);
            if(!mongoose.Types.ObjectId.isValid(pid)){
                throw new CustomeError({
                name: "Invalid ID",
                message: "El ID no es correcto",
                code:400,
                cause: productError(pid),
                });
            }
            const product = await this.productService.getProductbyId(pid);
            if (!product) {
                throw new CustomeError({
                    name: "Product not found",
                    message: "El producto no pudo ser encontrado",
                    code:404,
                  });
            }
            res.json(product);
        } catch (error) {
            next(error)
        }
    }
    async addProducts (req, res)  {
      let {title, description, code, price, status, stock, category, thumbnails} = req.body;
  
      if (!title) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Title!"});
          return false;
      }
  
      if (!description) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Description!"});
          return false;
      }
  
      if (!code) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Code!"});
          return false;
      }
  
      if (!price) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Price!"});
          return false;
      }
  
      status = !status && true;
  
      if (!stock) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Stock!"});
          return false;
      }
  
      if (!category) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Category!"});
          return false;
      }
  
      if (!thumbnails) {
          res.status(400).send({status:"error", message:"Error! No se cargó el campo Thumbnails!"});
          return false;
      } else if ((!Array.isArray(thumbnails)) || (thumbnails.length == 0)) {
          res.status(400).send({status:"error", message:"Error! Debe ingresar al menos una imagen en el Array Thumbnails!"});
          return false;
      }
  
      const result = await this.productService.addProduct({title, description, code, price, status, stock, category, thumbnails}); 
  
      if (result) {
          res.send({status:"ok", message:"El Producto se agregó correctamente!"});
      } else {
          res.status(500).send({status:"error", message:"Error! No se pudo agregar el Producto!"});
      }
  };

    async updateProduct(req, res) {
        try {
            const {
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnailssss,
              } = req.body;
              const pid = req.params.pid;
        
              const wasUpdated = await this.productService.updateProduct(pid, {
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnailssss,
              });
        
              if (wasUpdated) {
                res.send({
                  status: "ok",
                  message: "El Producto se actualizó correctamente!",
                });
                socketServer.emit("product_updated");
              } else {
                res.status(500).send({
                  status: "error",
                  message: "Error! No se pudo actualizar el Producto!",
                });
              }
        } catch (error) {
            console.log(error);
            res.status(500).send({status: "error", message: "Error Interno"});
        }
    }

    async deleteProduct(req, res) {
        try {
            const pid = req.params.pid;

            if (!mongoose.Types.ObjectId.isValid(pid)) {
                req.logger.error("ID del producto no válido");
                res.status(400).send({
                status: "error",
                message: "ID del producto no válido",
                });
                return;
            }

            const product = await this.productService.getProductById(pid);

            if (!product) {
                console.log("Producto no encontrado");
                res.status(404).send({
                status: "error",
                message: "Producto no encontrado",
                });
                return;
            }

            const wasDeleted = await this.productService.deleteProduct(pid);

            if (wasDeleted) {
                console.log("Producto eliminado exitosamente");
                res.send({
                status: "ok",
                message: "Producto eliminado exitosamente",
                });
                socketServer.emit("product_deleted", { _id: pid });
            } else {
                console.log("Error eliminando el producto");
                res.status(500).send({
                status: "error",
                message: "Error eliminando el producto",
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({
                status: "error",
                message: "Error interno del servidor",
            });
        }
    }
}

export default ProductController;