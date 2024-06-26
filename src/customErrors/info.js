
export const generateUserErrorInfo = (user) => {
  return `One or more fields are missing or invalid in the user.
    List of required properties:
    * first_name: needs to be a string, received ${user.first_name}
    * last_name: needs to be a string, received ${user.last_name}
    * email: needs to be a string, received ${user.email}`;
};


export const generateInfoProductError = (product) => {
    return `One or more properties were incomplete or invalid
    List of required product properties
    * title        : Need to be string, received: ${product.title}
    * description  : Need to be string, received: ${product.description}
    * description  : Need to be number, received: ${product.price}
    * thumbnails   : Need to be string, received: ${product.thumbnails}
    * stock        : Need to be number, received: ${product.stock}
    * code         : Need to be number, received: ${product.code}`;
};



export const generateAuthErrorInfo = (user, errorType) => {
  let errorMessage = "";
  switch (errorType) {
    case typeErrors.INVALID_TYPES_ERROR:
      errorMessage = `One or more products have invalid types:
        List of required types:
        * email: string ${typeof user.email}
        * cartId: string ${typeof user.cartId}
      `;
      break;
    case typeErrors.DATABASE_ERROR:
      errorMessage = "Error al acceder a la base de datos";
      break;
    case typeErrors.ROUTING_ERROR:
    default:
      errorMessage = "Error en la ruta";
      break;
    case typeErrors.AUTH_ERROR:
      errorMessage = "Error de autenticación";
      break;
  }
  return errorMessage;
};

//propertie deberia de contener un array de propiedades que no son validas y su tipo de dato
// export const genericInvalidErrorInfo = (message, properties) => {
//   let temporalMessage = message;
//   let listOfProperties = "";
//   properties.forEach((property) => {
//     listOfProperties += `* ${property.name}: needs to be a ${property.type}, received ${property.value}\n`;
//   });
//   return `${temporalMessage}
//     ${listOfProperties}`;
// };
