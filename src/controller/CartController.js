import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";

//===============Xem giỏ hàng trước khi thanh toán
let checkCart = (id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      //let exist=pool.execute('delete from cart where id_cart=? and id_account=?',[id_cart,id_account])
      let check = {};
      let [rowCount] = await pool.execute(
        "select count(*) as count from cart where id_account=? ",
        [id_account]
      );
      //console.log(rowCount);
      check.exist = rowCount[0].count > 0;
      resolve(check);
    } catch (error) {
      reject(error);
    }
  });
};

let selectAccount = (id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [data] = await pool.execute(
        // "select c.id_product,c.quantity,p.name_product,p.price,CAST((p.price - (p.price * pc.percentage)) AS SIGNED) as price_reducing,p.images,p.detail from cart c,product p,product_promotion pc where c.id_account=? and c.id_product =p.id_product and p.id_promotion = pc.id_promotion",
        `SELECT
        c.id_product,
        c.quantity,
        p.name_product,
        p.price,
        (p.price - (p.price * pc.percentage /100)) AS price_reducing,
        p.images,
        p.detail
    FROM
        cart c
    JOIN
        product p ON c.id_product = p.id_product
    JOIN
        product_promotion pc ON p.id_promotion = pc.id_promotion
    WHERE
        c.id_account = ?`,
        [id_account]
      );
      //console.log(data);
      resolve(data);
    } catch (error) {
      reject(err);
    }
  });
};

let getCart = async (req, res) => {
  try {
    let id_account = auth.tokenData(req).id_account;
    //select name,price,images from cart c,product p where c.id_account=id_account and c.id_product =p.id_product
    let check = await checkCart(id_account);
    if (!check.exist) {
      return res.status(200).json({
        message: "Chưa có sản phẩm để thanh toán",
      });
    }

    let listProduct = await selectAccount(id_account);
    console.log(">>>> Check list: ", listProduct[0]);
    let totalPrice = 0;

    for (let i in listProduct) {
      let productPrice = listProduct[i].quantity * listProduct[i].price;
      totalPrice += productPrice;
    }
    return res.json({
      list: listProduct,
      total: totalPrice,
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};
///////////////////////////////////////

//=================Thêm sản phẩm vô giỏ hàng
let hasProductAccount = (id_account, id_product) => {
  return new Promise(async (resolve, reject) => {
    try {
      //let check = {}
      let [data] = await pool.execute(
        "select * from cart where id_account= ? and id_product=?",
        [id_account, id_product]
      );
      let result = { ...data[0] };
      if (!data[0]) {
        resolve(false);
      } else {
        console.log(">>> Check data[0]: ", result);
        resolve(result);
      }
    } catch (err) {
      reject(err);
    }
  });
};

let addQuantity = (id_account, id_product, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      let add = await pool.execute(
        "UPDATE cart SET quantity = quantity + ? WHERE id_account = ? AND id_product = ?",
        [quantity, id_account, id_product]
      );
      console.log("Check addQuantity: ", add);
      resolve(add);
    } catch (error) {
      reject(error);
    }
  });
};

let addCart = (id_account, id_product, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      let add = await pool.execute(
        "INSERT INTO cart (id_account, id_product, quantity) VALUES (?, ?, ?)",
        [id_account, id_product, quantity]
      );
      console.log("Check addCart: ", add);
      resolve(add);
    } catch (error) {
      reject(error);
    }
  });
};

/* Note lại ý tưởng:
    Khi thêm sp vào cart:
    Size bắt buộc
    1. Check xem sp có trong cart chưa(Cùng size) 
    2. Chưa cùng thì thêm 

    */
let addProduct = async (req, res) => {
  try {
    let { id_product } = req.params;
    let quantity = Number(req.body.quantity);
    let id_account = auth.tokenData(req).id_account;

    if (quantity < 1) {
      return res.status(400).json({
        message: "Số lượng phải lớn hơn 0",
      });
    }

    if (!quantity) {
      quantity = 1;
    }

    // Kiểm tra xem sản phẩm có trong giỏ hàng chưa
    let check = await hasProductAccount(id_account, id_product);

    if (!check) {
      // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
      let add = await addCart(id_account, id_product, quantity);
    } else {
      // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
      let add = await addQuantity(id_account, id_product, quantity);
    }

    return res.status(200).json({
      message: "Thêm vào giỏ hàng thành công",
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

////////////////////////////////////////

//=========Xóa 1 sản phẩm khỏi giỏ hàng
let deleteProduct = (id_product, id_account, size) => {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await pool.execute(
        "delete from cart where id_product=? and id_account=?",
        [id_product, id_account]
      );
      console.log(">>Check delete Product", deleted);
      resolve(deleted);
    } catch (error) {
      reject(error);
    }
  });
};

let hasCart = (id_product, id_account, size) => {
  return new Promise(async (resolve, reject) => {
    try {
      //let exist=pool.execute('delete from cart where id_cart=? and id_account=?',[id_cart,id_account])
      let check = {};
      let [rowCount] = await pool.execute(
        "select count(*) as count from cart where id_product=? and id_account=?",
        [id_product, id_account]
      );
      console.log(rowCount);
      check.exist = rowCount[0].count > 0;
      resolve(check);
    } catch (error) {
      reject(error);
    }
  });
};

let deleteProductFromCart = async (req, res) => {
  try {
    let id_product = req.params.id_product;
    let id_account = auth.tokenData(req).id_account;
    // let size = req.body.size;
    // console.log("Size: ", size);
    // if (!id_product) {
    //   return res.json({
    //     message: "Sản phẩm không tồn tại",
    //   });
    // }
    let check = await hasCart(id_product, id_account);
    if (check.exist) {
      let deleted = await deleteProduct(id_product, id_account);
    } else {
      return res.status(201).json({
        message: "Sản phẩm không tồn tại",
      });
    }
    return res.status(200).json({
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

let addCategory = (name, logo) => {
  return new Promise(async (resolve, reject) => {
    try {
      let add = await pool.execute(
        "insert into category (name, logo) values (?,?)",
        [name, logo]
      );
      //console.log('Check addCart: ', add);
      resolve(add);
    } catch (error) {
      reject(error);
    }
  });
};

let DecrementProductFromCart = async (req, res) => {
  try {
    let id_product = req.params.id_product;
    let id_account = auth.tokenData(req).id_account;
    console.log(req.body);
    let quantity = Number(req.body.quantity);
    // let quantity = req.body.data.quantity;
    // let size = req.body.data.size;
    console.log(id_product, id_account, quantity);
    if (quantity > 0) {
      let giam = await pool.execute(
        "UPDATE `cart` SET quantity=? WHERE id_product=? and id_account=?",
        [quantity - 1, id_product, id_account]
      );
    }
    return res.status(200).json({
      message: "Giảm thành công số lượng sản phẩm trong giỏ hàng",
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

let IncrementProductFromCart = async (req, res) => {
  try {
    let id_product = req.params.id_product;
    let id_account = auth.tokenData(req).id_account;
    console.log(req.body);
    let quantity = Number(req.body.quantity);
    // let size = req.body.data.size;
    console.log(id_product, id_account, quantity);
    if (quantity > 0) {
      let giam = await pool.execute(
        " UPDATE `cart` SET quantity=? WHERE id_product=? and id_account=?",
        [quantity + 1, id_product, id_account]
      );
    }
    return res.status(200).json({
      message: "Tăng thành công số lượng sản phẩm trong giỏ hàng",
    });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
};

module.exports = {
  getCart,
  addProduct,
  deleteProductFromCart,
  addCategory,
  DecrementProductFromCart,
  IncrementProductFromCart,
};
