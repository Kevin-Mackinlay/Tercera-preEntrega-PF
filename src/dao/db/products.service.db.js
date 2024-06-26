import productModel from "../../dao/models/product.model.js";
import { logger } from "../../utils/logger.js";

export default class ProductsService {


  async addProduct(Product) {
    try {
      return await productModel.create(Product);
    } catch (error) {
      console.log(error);
      logger.error(error);
    }
  }

  async get(filter) {
    try {
      console.log(filter);
    return await productModel.paginate({}, filter?.options);
    } catch (error) {
      console.log(error);
      logger.error(error);
    }
  }

  async getProductById(id) {
    try {
      return await productModel.findById( id);
    } catch (error) {
      logger.error(error);
    }
  }

  async update(id, updateBody) {
    try {
      return await productModel.updateOne({ _id: id }, updateBody);
    } catch (error) {
      logger.error(error);
    }
  }

  async delete(id) {
    try {
      return await productModel.deleteOne({ _id: id });
    } catch (error) {
      logger.error(error);
    }
  }
}
