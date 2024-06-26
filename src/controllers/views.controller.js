export default class ViewsController {
  constructor(productService, ticketService, userService, cartService) {
    console.log("Received UserService in constructor:", userService); // Add this log
    if (!userService || typeof userService.findOne !== "function") {
      throw new Error("UserService must be provided and must have a findOne method");
    }
    this.productService = productService;
    this.ticketService = ticketService;
    this.userService = userService;
    this.cartService = cartService;
  }

  renderHome = async (req, res) => {
    res.render("home", {
      title: "Home",
      user: req.user,
    });
  };

  renderProducts = async (req, res) => {
    try {
      const { limit = 8, page = 1, sort, category } = req.query;
      const filter = {
        options: {
          limit,
          page,
          lean: true,
        },
      };
      if (category) {
        filter.query = { category: category };
      }

      if (sort) {
        filter.options.sort = { price: sort };
      }
      const pagesData = await this.productService.getProducts(filter);
      console.log(pagesData);

      // COMMENT: La lógica que se utiliza acá no estaría en caso de trabajar con React, ya que se podría generar el link en el front-end
      const baseUrl = `http://localhost:8080/products?limit=${limit}`;
      // Creo links para las páginas anterior y siguiente de manera dinámica
      pagesData.prevLink = pagesData.hasPrevPage && `${baseUrl}&page=${pagesData.prevPage}${sort ? "&sort=" + sort : ""}${category ? "&category=" + category : ""}`;

      pagesData.nextLink = pagesData.hasNextPage && `${baseUrl}&page=${pagesData.nextPage}${sort ? "&sort=" + sort : ""}${category ? "&category=" + category : ""}`;

      if (pagesData.docs.length < 1) {
        res.status(404).json({
          success: false,
          message: "Could not retrieve products",
        });
        return;
      }

      res.render("products", {
        title: "Listado de productos",
        data: {
          products: pagesData.docs,
          prevLink: pagesData.prevLink,
          nextLink: pagesData.nextLink,
        },
        user: req.user,
        style: "css/products.css",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  renderLogin = async (req, res) => {
    res.render("login", {
      title: "Login",
      style: "css/login.css",
    });
  };

  renderSignup = async (req, res) => {
    res.render("signup", {
      title: "Registro",
      style: "css/signup.css",
    });
  };

  renderLogout = async (req, res) => {
    res.render("logout", {
      title: "Logout",
      user: req.user,
      style: "css/logout.css",
    });
  };

  renderRealTime = async (req, res) => {
    const products = await this.productService.getProducts();
    res.render("realtime", {
      title: "Productos en tiempo real",
      products: products,
      style: "css/products.css",
    });
  };

  renderChat = async (req, res) => {
    res.render("chat", {
      title: "Chat",
      style: "css/chat.css",
    });
  };

  renderTickets = async (req, res) => {
    res.render("tickets", {
      title: "Tickets",
      user: req.user,
      style: "css/tickets.css",
    });
  };

  recoverPassword = async (req, res) => {
    try {
      res.render("recoverPassword", {
        title: "Recover Password",
        style: "css/recoverPassword.css",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  newPassword = async (req, res) => {
    try {
      if (!this.userService || typeof this.userService.findOne !== "function") {
        console.error("UserService is incorrectly initialized:", this.userService);
        throw new Error("UserService is not initialized correctly");
      }

      const { token, email } = req.query;

      // Fetch user based on email, token, and check if token hasn't expired
      const user = await this.userService.findOne({
        email: email,
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }, // Checking if the token is still valid
      });

      // Additional logging to understand the state
      if (user) {
        console.log("User found, token is valid:", user);
        // Proceed with password reset logic here...
      } else {
        console.log("No user found, or token is invalid or expired.");
        res.status(400).json({ success: false, message: "Invalid or expired token" });
        return;
      }

      res.render("newPassword", {
        title: "New Password",
        style: "css/newPassword.css",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  renderCartView = async (req, res) => {
    try {
      const userId = req.user._id; // Ensuring req.user is populated by isAuthenticated middleware

      // Fetch user to get cart information, assuming that the user object contains a cart
      const user = await this.userService.getUserById(userId); // Ensure this method exists and works correctly

      if (!user || !user.cart || user.cart.length === 0) {
        return res.status(404).json({ error: "No cart found for this user." });
      }

      const cartId = user.cart[0]._id;
      const cart = await this.cartService.getCartById(cartId);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }

      // Assume that cart has an array of product IDs
      const productsInCart = cart.products;
      const cartDetail = [];
      let totalPrice = 0;

      for (let product of productsInCart) {
        let productDetail = await this.productService.getProductById(product.productID);
        productDetail = productDetail.toObject(); // Convert Mongoose document to plain object, if needed
        productDetail.quantity = product.quantity;
        cartDetail.push(productDetail);
        totalPrice += productDetail.price * product.quantity;
      }

      // Render cart view with details
      res.render("carts", {
        title: "Your Cart",
        style: "css/cart.css",
        cartDetail,
        totalPrice,
      });
    } catch (error) {
      console.error("Error rendering cart:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  purchaseView = async (req, res) => {
    let purchaseComplete = []; //array de productos comprados
    let purchaseError = []; // array para productos que no se pudieron comprar
    let precioTotal = 0;
    const userId = req.user._id;

    try {
      const findUser = await this.userService.getUser(userId);
      if (!findUser) {
        throw new Error("User not found");
      }

      const cartId = findUser.cart[0]._id; // cart[0]porque es el primer elemento del array
      const cart = await this.cartService.getCartById(cartId);
      if (!cart) {
        throw new Error("Cart not found");
      }

      const productsInCart = cart.products;

      for (let product of productsInCart) {
        const idProduct = product.productID;
        const quantity = product.quantity;
        const productDetail = await this.productService.getProductById(idProduct);

        if (quantity > productDetail.stock) {
          //verificamos que la compra no supere el stock
          purchaseError.push(productDetail); //agrega el producto al array de error
        }

        if (quantity <= productDetail.stock) {
          let productUpdate = productInDB;
          let quantityUpdate = productInDB.stock - quantity;
          productUpdate.stock = quantityUpdate; //actualizamos el stock
          const update = await this.productService.updateProduct(idProduct, productUpdate); //actualizamos el producto en la base de datos
          purchaseComplete.push(product); //agregamos el producto al array de compra
          const monto = productDetail.price * quantity;
          precioTotal = precioTotal + monto;
        }
      }

      //Eliminamos los productos que se procesaron correctamente del carrito, e insertamos el array de productos no procesados
      const notPurchasedProductsInCart = await this.cartService.insertArrayOfProducts(cartId, purchaseError);

      // solo creamos el ticket si hay productos en purchaseComplete
      if (purchaseComplete.length > 0) {
        //definimos los datos que necesitamos para crear el ticket
        const ticketData = {
          amount: precioTotal,
          purchaser: req.user.email,
        };
        //creamos el ticket en la base de datos
        const ticket = await this.ticketService.createTicket(ticketData);

        //MODIFICACIONES PARA QUE RENDERICE LA VISTA:
        //agregamos informacion adicional, los productos que se procesaron correctamente y lo que no
        const purchaseData = {
          ticketId: ticket._id,
          amount: ticket.amount,
          purchase_datetime: ticket.purchase_datetime,
          purchaser: ticket.purchaser,
          productosProcesados: purchaseComplete,
          productosNoProcesados: purchaseError,
        };

        //renderizamos la vista 'purchase' con la informacion de la compra
        res.status(200).render("purchase", { status: "success", payload: purchaseData, cartId });
      } else {
        // Si no hay productos en purchaseComplete, renderizamos la vista 'error' con los productos en purchaseError
        res.status(200).send("errorPurchase", { status: "success", message: " No se procesaron  los productos, por falta de stock.", productosNoProcesados: purchaseError });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: error.message });
    }
  };

  upLoadDocument = async (req, res) => {
    if (!req.user) {
      return res.status(401).send({ message: "User not authenticated" });
    }
    const userId = req.user._id;

    // Invoke Multer middleware for handling file upload
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).send({ message: err });
      }

      if (!req.file) {
        return res.status(400).send({ message: "No file selected!" });
      }

      res.render("uploadDocuments", {
        userId,
        file: `uploads/${req.file.filename}`, // Path to the uploaded file
      });
    });
  };
}
