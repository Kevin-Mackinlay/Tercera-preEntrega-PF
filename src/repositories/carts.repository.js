import {logger}  from "../utils/logger.js";

export default class CartsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getCarts = async () => {
    try {
      return await this.dao.getCarts();
    } catch (error) {
      logger.error(error);
    }
  };

  getCartById = async (cid) => {
    try {
      return await this.dao.getCartById(cid);
    } catch (error) {
      console.log(error);
      logger.error(error);
    }

  };

  createCart = async () => {
    try {
      return await this.dao.createCart();
    } catch (error) {
      console.log(error);
      logger.error(error);
    }
  };

  addProductAndUpdate = async (cid, pid) => {
    try {
      return await this.dao.addAndUpdate(cid, pid);
    } catch (error) {
      logger.error(error);
    }
  };

  deleteProduct = async (cid, pid) => {
    try {
      return await this.dao.deleteOne(cid, pid);
    } catch (error) {
      logger.error(error);
    }
  };

  deleteAllProd = async (cid) => {
    try {
      return await this.dao.deleteAll(cid);
    } catch (error) {
      logger.error(error);
    }
  };

  deleteCart = async (cid) => {
    try {
      return await this.dao.delete(cid);
    } catch (error) {
      logger.error(error);
    }
  };
}
