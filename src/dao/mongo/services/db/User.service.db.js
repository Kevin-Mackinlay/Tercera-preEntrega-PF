import UserModel from "../../dao/models/user.model.js"; 

export default class UserService {
  constructor(dao) {
    this.dao = dao;
  }
   async createUser(user) {
    const newUser = await this.dao.create(user);
    return newUser;
  }

  async getUserByEmail(email) {
    const user = await  this.dao.findOne({email}).lean();
    return user;

  }

  async getUserById(id) {
    const user =  await this.dao.findById(id).lean(); 
    return user;
  }
}