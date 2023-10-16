import { request } from "express";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";

//Xem đơn đặt hàng
//note ý tưởng
//insert into order_detail(id_product,mount) values(?,?) where id_account=token

let insertOrder = (id_account, discount_id, id_address) => {
  return new Promise(async (resolve, reject) => {
    try {
      let order = await pool.execute(
        "INSERT INTO `orders` (id_account, status, discount_id, id_address) VALUES (?, 1, ?, ?)",
        [id_account, discount_id, id_address]
      );
      let [check] = await pool.execute(
        "SELECT * FROM `orders` ORDER BY id_order DESC LIMIT 1"
      );
      if (!check[0]) {
        resolve("Đơn hàng trống");
      } else {
        resolve(check[0]);
      }
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

// let listDetailOrder = (id_order, id_account) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let [listDetail] = await pool.execute(
//         "SELECT o.id_order, c.id_product, c.quantity, p.name_product, p.price_reducing FROM cart c JOIN `orders` o ON c.id_account = o.id_account JOIN product p ON p.id_product = c.id_product WHERE o.status = 1 AND c.id_account = ? AND id_order = ?",
//         [id_account, id_order]
//       );
//       if (!listDetail[0]) {
//         resolve(false);
//       } else {
//         resolve(listDetail);
//       }
//     } catch (err) {
//       reject(err);
//     }
//   });
// };

// let insertDetailOrder = (id_order, id_product, quantity, price_reducing) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let [insert] = await pool.execute(
//         "INSERT INTO order_detail (id_order, id_product, quantity, price_reducing) VALUES (?, ?, ?, ?)",
//         [id_order, id_product, quantity, price_reducing]
//       );
//       console.log(">>> check insert: ", insert);
//       resolve(insert);
//     } catch (err) {
//       reject(err);
//     }
//   });
// };
let listDetailOrder = (id_order, id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [listDetail] = await pool.execute(
        // "SELECT o.id_order, c.id_product, c.quantity, p.name_product, CAST((p.price - (p.price * pc.percentage)) AS SIGNED) as price_reducing FROM cart c JOIN `orders` o ON c.id_account = o.id_account JOIN product p ON p.id_product = c.id_product WHERE o.status = 1 AND c.id_account = ? AND id_order = ?",
        `SELECT o.id_order, c.id_product, c.quantity, p.name_product, 
        CAST((p.price - (p.price * pc.percentage)) AS SIGNED) as price_reducing 
    FROM cart c 
    JOIN orders o ON c.id_account = o.id_account 
    JOIN product p ON p.id_product = c.id_product 
    JOIN product_promotion pc ON p.id_promotion = pc.id_promotion
    WHERE o.status = 1 AND c.id_account = ? AND id_order = ?
    `,
        [id_account, id_order]
      );
      if (!listDetail[0]) {
        resolve(false);
      } else {
        resolve(listDetail);
      }
    } catch (err) {
      reject(err);
    }
  });
};

let insertDetailOrder = (id_order, id_product, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [insert] = await pool.execute(
        "INSERT INTO order_detail (id_order, id_product, quantity) VALUES (?, ?, ?)",
        [id_order, id_product, quantity]
      );
      console.log(">>> check insert: ", insert);
      resolve(insert);
    } catch (err) {
      reject(err);
    }
  });
};

let datHangNew = async (req, res) => {
  let id_account = auth.tokenData(req).id_account;
  let arr = req.body.arr;
  let discount_id = req.body.discount_id || null; // Chỉnh sửa tên biến
  let id_address = req.body.id_address || null;
  let check = await checkCart(id_account);
  if (check) {
    try {
      let insert = await insertOrder(id_account, discount_id, id_address);
      let id_order = insert.id_order;
      let listDetails = await listDetailOrder(id_order, id_account);

      console.log("Id_order:", id_order);
      console.log(">>Check list detail: ", arr);

      if (arr && listDetails) {
        // Kiểm tra xem arr và listDetails có dữ liệu hay không
        for (let i in arr) {
          console.log(id_order, arr[i].id_product, arr[i].quantity);
          let insert = await insertDetailOrder(
            id_order,
            arr[i].id_product,
            arr[i].quantity
          );
        }
        // for (let i in listDetails) {
        //   let del = await deleteCart(id_account, listDetails[i].id_product);
        // }
        return res.status(200).json({
          order: "Đặt hàng thành công!",
        });
      } else {
        return res.status(400).json({
          message: "Đặt hàng thất bại!",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Đặt hàng thất bại!",
      });
    }
  } else {
    return res.status(400).json({
      message: "Giỏ hàng của bạn trống nên không thể đặt hàng!",
    });
  }
};

let deleteCart = (id_account, id_product) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Id_account: ", id_account);
      console.log("Id_product:", id_product);
      let [del] = await pool.execute(
        "delete from cart where id_account=? and id_product=?",
        [id_account, id_product]
      );
      resolve(del);
    } catch (err) {
      reject(err);
    }
  });
};

let checkCart = (id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [check] = await pool.execute(
        "select * from cart where id_account=? ",
        [id_account]
      );
      if (!check[0]) {
        resolve(false);
      } else {
        resolve(true);
      }
    } catch (err) {
      reject(err);
    }
  });
};

let getOrder = async (req, res) => {
  let id_account = auth.tokenData(req).id_account;

  let check = await checkCart(id_account);
  if (check) {
    let insert = await insertOrder(id_account);
    let id_order = insert.id_order;
    let listDetails = await listDetailOrder(id_order, id_account);

    console.log("Id_order:", id_order);
    console.log(">>Check list detail: ", listDetails);
    if (listDetails) {
      for (let i in listDetails) {
        //(id_order, id_product, quantity, name, price)
        let insert = await insertDetailOrder(
          id_order,
          listDetails[i].id_product,
          listDetails[i].quantity,
          listDetails[i].name_product,
          listDetails[i].price
        );
        // (id_account, id_product)
        let del = await deleteCart(id_account, listDetails[i].id_product);
      }
    } else {
      return res.status(400).json({
        message: "Đặt hàng thất bại!",
      });
    }
  } else {
    return res.status(400).json({
      message: "Giỏ hàng của bạn trống nên không thể đặt hàng!",
    });
  }
  return res.status(200).json({
    order: "Đặt hàng thành công!",
  });
};

//Xem chi tiết đơn đặt hàng
let selectIdOrder = (id_account) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [idOrder] = await pool.execute(
        "select id_order from orders where id_account=?",
        [id_account]
      );
      if (!idOrder[0]) {
        resolve(false);
      } else {
        resolve(idOrder[0].id_order);
        console.log(idOrder[0]);
      }
    } catch (err) {
      reject(err);
    }
  });
};

let detail = (id_order) => {
  return new Promise(async (resolve, reject) => {
    try {
      let [detail] = await pool.execute(
        // "select * from order_detail where id_order=?",
        // [id_order]
        `SELECT
        o.id_order,
        o.order_time,
        o.id_account,
        o.status,
        d.percentage AS discount_percentage,
        c.name_product,
        c.detail,
        c.images,
        a.name AS customer_name,
        a.address AS customer_address,
        a.phone AS customer_phone,
        da.name_address AS delivery_address,
        da.name_receiver,
        da.phone_receiver,
        p.price AS original_price,
        od.quantity,
        CASE
            WHEN p.id_promotion IS NOT NULL THEN p.price - (p.price * pp.percentage / 100)
            ELSE p.price
        END AS price_reducing
    FROM
        orders o
    INNER JOIN
        order_detail od ON o.id_order = od.id_order
    INNER JOIN
        product c ON od.id_product = c.id_product
    INNER JOIN
        account a ON o.id_account = a.id_account
    LEFT JOIN
        discount d ON o.discount_id = d.discount_id
    LEFT JOIN
        delivery_address da ON o.id_address = da.id_address
    LEFT JOIN
        product_promotion pp ON c.id_promotion = pp.id_promotion
    LEFT JOIN
        product p ON c.id_product = p.id_product
    WHERE
        o.id_order = ?;    
    `,
        [id_order]
      );
      console.log(detail[0]);
      if (!detail) {
        resolve("Chi tiết đơn hàng không tồn tại");
      } else {
        resolve(detail);
      }
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

let getDetailOrder = async (req, res) => {
  //let id_account = auth.tokenData(req).id_account
  let { id_order } = req.params;
  //let details = await detail(id_order)
  let details = await detail(id_order);
  console.log(details);
  let total = 0;
  details.map((item, index) => {
    total += item.quantity * item.price_reducing;
  });
  console.log("tổng: ", total);
  return res.status(200).json({
    // detailOrder: details
    listOrderDetail: details,
    total,
  });
};

let getOrderNew = async (req, res) => {
  try {
    let [order] = await pool.execute(
      "SELECT * from account a,orders o where a.id_account=o.id_account order by o.order_time DESC"
    );
    return res.status(200).json({
      listOrder: order,
    });
  } catch (e) {
    console.log(e);
  }
};

let xacNhanDonHang = (req, res) => {
  try {
    let id_order = req.params.id_order;
    let update = pool.execute(
      "UPDATE orders SET status = 2 WHERE id_order = ?",
      [id_order]
    );
    return res.status(200).json({
      errCode: 0,
      message: "Đơn hàng đã được xác nhận",
    });
  } catch (e) {
    console.log(e);
  }
};

let hoanThanhDonHang = async (req, res) => {
  try {
    //let id_account = auth.tokenData(req).id_account
    let { id_order } = req.params;
    //let details = await detail(id_order)
    let details = await detail(id_order);
    console.log(details);
    let total = 0;
    details.map((item, index) => {
      total += item.quantity * item.price;
    });
    console.log("tổng: ", total);
    //('insert into orders(id_account,status) values(?,1)', [id_account])
    let updatedoanhthu = pool.execute(
      "insert into revenue(id_order,total) values(?,?)",
      [id_order, total]
    );
    let update = pool.execute(
      "UPDATE orders SET status = 0 WHERE id_order = ?",
      [id_order]
    );
    return res.status(200).json({
      // detailOrder: details
      total,
      errCode: 0,
      message: "Đơn hàng đã hoàn thành",
    });
  } catch (e) {
    console.log(e);
  }
};

let huyDonHang = (req, res) => {
  try {
    let id_order = req.params.id_order;
    let update = pool.execute(
      "UPDATE orders SET status = 3 WHERE id_order = ?",
      [id_order]
    );
    return res.status(200).json({
      errCode: 0,
      message: "Đơn hàng đã được hủy",
    });
  } catch (e) {
    console.log(e);
  }
};

let xemDoanhSo = async (req, res) => {
  let year = req.query?.year || 2023;
  //let details = await detail(id_order)
  console.log("HEllo");
  // let [listDoanhSo] = await pool.execute('SELECT * FROM doanhthu d,orders o where d.id_order=o.id_order')
  let [listDoanhSo] = await pool.execute(
    // "SELECT month(order_time) as thang,sum(total) as total_doanhso FROM order o,doanhthu d where o.id_order=d.id_order and year(order_time)=? GROUP BY month(order_time)",
    `SELECT 
    MONTH(o.order_time) AS months, 
    SUM(d.total) AS total_revenue
    FROM orders o
    JOIN revenue d ON o.id_order = d.id_order
    WHERE YEAR(o.order_time) = ?
    GROUP BY MONTH(o.order_time);

    `,
    [year]
  );
  console.log(listDoanhSo);
  return res.status(200).json({
    // detailOrder: details
    listDoanhSo: listDoanhSo,
  });
};

let xemDoanhSoThang = async (req, res) => {
  let month = req.params?.month;
  let year = req.params?.year;
  //let details = await detail(id_order)
  console.log("HEllo");
  // let [listDoanhSo] = await pool.execute('SELECT * FROM doanhthu d,orders o where d.id_order=o.id_order')
  let [listDoanhSoThang] = await pool.execute(
    // "SELECT day(order_time) as ngay,sum(total) as total_doanhso FROM order o,doanhthu d where o.id_order=d.id_order and month(order_time)=? and year(order_time)=? GROUP BY day(order_time)",
    `SELECT 
        DAY(order_time) AS day, 
        SUM(total) AS total_revenue
    FROM orders o
    JOIN revenue d ON o.id_order = d.id_order
    WHERE MONTH(order_time) = ? AND YEAR(order_time) = ?
    GROUP BY DAY(order_time)
    `,
    [month, year]
  );
  console.log(listDoanhSoThang);
  return res.status(200).json({
    // detailOrder: details
    listDoanhSoThang: listDoanhSoThang,
  });
};

// let orderHistory = async (req, res) => {
//   try {
//     let id_account = req.params.id_account;
//     let status = req.params.status;
//     console.log(id_account);
//     let [response] = await pool.execute(
//       `SELECT
//       temp_result.id_order,
//       temp_result.order_time,
//       temp_result.status,
//       temp_result.discount_id,
//       JSON_OBJECT(
//           'id_product', temp_result.id_product,
//           'name_product', temp_result.name_product,
//           'quantity', temp_result.quantity,
//           'detail', temp_result.detail,
//           'images', temp_result.images
//       ) AS products,
//       a.name AS account_name,
//       a.address AS account_address
//   FROM
//       (SELECT
//           a.id_order,
//           a.id_product,
//           a.quantity,
//           b.order_time,
//           b.status,
//           b.discount_id,
//           c.name_product,
//           c.detail,
//           c.images,
//           d.discount_code,
//           d.percentage,
//           b.id_account -- Thêm cột id_account vào kết quả
//       FROM
//           order_detail a
//       JOIN
//           orders b ON a.id_order = b.id_order
//       JOIN
//           product c ON a.id_product = c.id_product
//       LEFT JOIN
//           discount d ON b.discount_id = d.discount_id
//       WHERE
//           b.id_account = ? AND b.status = ?
//       ORDER BY
//           b.order_time DESC) AS temp_result
//   LEFT JOIN
//       account a ON temp_result.id_account = a.id_account
//   GROUP BY
//       temp_result.id_order;

//     `,
//       [id_account, status]
//     );

//     // Biến đổi dữ liệu sau khi truy vấn
//     const listOrder = response.map((row) => ({
//       id_order: row.id_order,
//       order_time: row.order_time,
//       id_account: row.id_account,
//       name: row.account_name,
//       address: row.account_address,
//       status: row.status,
//       discount_id: row.discount_id,
//       products: JSON.parse(`[${row.products}]`),
//     }));

//     return res.status(200).json({
//       listOrder,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

let orderHistory = async (req, res) => {
  try {
    let id_account = req.params.id_account;
    let status = req.params.status;

    // Thực hiện câu truy vấn SQL
    let [response] = await pool.execute(
      `
      SELECT
      temp_result.id_order,
      temp_result.order_time,
      temp_result.id_account,
      temp_result.status,
      temp_result.discount_id,
      CONCAT('[', GROUP_CONCAT(
        JSON_OBJECT(
          'id_product', temp_result.id_product,
          'name_product', temp_result.name_product,
          'quantity', temp_result.quantity,
          'detail', temp_result.detail,
          'images', temp_result.images,
          'price', temp_result.price,
          'price_reducing',temp_result.price_reducing
        )
      ), ']') AS products,
      a.name AS account_name,
      a.address AS account_address,
      a.phone AS account_phone,
      temp_result.percentage AS discount_percentage,
      da.id_address AS id_delivery_address,
      da.name_address AS name_address,
      da.name_receiver,
      da.phone_receiver
    FROM (
      SELECT DISTINCT
        a.id_order,
        a.id_product,
        a.quantity,
        b.order_time,
        b.id_account,
        b.status,
        b.discount_id,
        c.name_product,
        c.detail,
        c.images,
        c.price,
        CAST((c.price - (c.price * pc.percentage / 100)) AS SIGNED) as price_reducing,
        d.discount_code,
        d.percentage,
        da.id_address,
        da.name_address,
        da.name_receiver,
        da.phone_receiver
      FROM
        order_detail a
      JOIN
        orders b ON a.id_order = b.id_order
      JOIN
        product c ON a.id_product = c.id_product
      LEFT JOIN
        discount d ON b.discount_id = d.discount_id
      LEFT JOIN
        product_promotion pc ON pc.id_promotion = c.id_promotion
      LEFT JOIN
        delivery_address da ON da.id_address = b.id_address
      WHERE
        b.id_account = ? AND b.status = ?
      ORDER BY
        b.order_time DESC
    ) AS temp_result
    LEFT JOIN
      account a ON temp_result.id_account = a.id_account
    LEFT JOIN
      delivery_address da ON temp_result.id_account = da.id_account
    GROUP BY
      temp_result.id_order;

    `,
      [id_account, status]
    );

    // Biến đổi dữ liệu sau khi truy vấn
    const listOrder = response.map((row) => ({
      id_order: row.id_order,
      order_time: row.order_time,
      id_account: row.id_account,
      name: row.account_name,
      address: row.account_address,
      phone: row.account_phone,
      status: row.status,
      discount_id: row.discount_id,
      discount_percentage: row.discount_percentage,
      id_address: row.id_address,
      name_address: row.name_address,
      name_receiver: row.name_receiver,
      phone_receiver: row.phone_receiver,
      products: JSON.parse(row.products),
    }));

    return res.status(200).json({
      listOrder,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi truy vấn dữ liệu đơn hàng.",
    });
  }
};

let orderAccount = async (req, res) => {
  try {
    let id_account = req.params.id_account;
    console.log(id_account);
    let [response] = await pool.execute(
      "SELECT o.id_order,o.order_time,o.id_account,o.status,o.discount_id,a.name,a.address FROM orders o,account a WHERE a.id_account=o.id_account and o.id_account=? ORDER by o.id_order DESC",
      [id_account]
    );
    return res.status(200).json({
      listOrder: response,
    });
  } catch (e) {
    console.log(e);
  }
};

const getAddressDelivery = async (req, res) => {
  try {
    const id_account = auth.tokenData(req).id_account;

    // Truy vấn địa chỉ giao hàng từ cơ sở dữ liệu dựa trên id tài khoản
    let [response] = await pool.execute(
      "select * from delivery_address where id_account=?",
      [id_account]
    );

    return res.json({
      listAddress: response, // Trả về danh sách địa chỉ giao hàng
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const createAddressDelivery = async (req, res) => {
  try {
    const id_account = auth.tokenData(req).id_account;
    const { name_address, name_receiver, phone_receiver } = req.body;

    // Thực hiện việc tạo địa chỉ giao hàng trong cơ sở dữ liệu
    const [result] = await pool.execute(
      "INSERT INTO delivery_address (id_account, name_address,name_receiver,phone_receiver) VALUES (?,?,?,?)",
      [id_account, name_address, name_receiver, phone_receiver]
    );

    if (result.affectedRows > 0) {
      return res.json({
        message: "Địa chỉ giao hàng đã được tạo thành công.",
      });
    } else {
      return res.json({
        message: "Tạo địa chỉ giao hàng thất bại.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const updateAddressDelivery = async (req, res) => {
  try {
    let id_account = auth.tokenData(req).id_account;
    let id_address = req.params.id_address;
    let { name_address, name_receiver, phone_receiver } = req.body;

    // Thực hiện truy vấn SQL để cập nhật địa chỉ giao hàng
    const [result] = await pool.execute(
      "UPDATE delivery_address SET name_address = ?, name_receiver = ?, phone_receiver = ? WHERE id_account = ? AND id_address = ?",
      [name_address, name_receiver, phone_receiver, id_account, id_address]
    );

    if (result.affectedRows > 0) {
      return res.json({
        message: "Địa chỉ giao hàng đã được cập nhật thành công.",
      });
    } else {
      return res.json({
        message:
          "Không tìm thấy địa chỉ giao hàng hoặc cập nhật không thành công.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const deleteAddressDelivery = async (req, res) => {
  try {
    const id_account = auth.tokenData(req).id_account;
    const id_address = req.params.id_address; // Lấy id_address cần xóa từ tham số URL

    // Thực hiện truy vấn SQL để xóa địa chỉ giao hàng
    const [result] = await pool.execute(
      "DELETE FROM delivery_address WHERE id_account = ? AND id_address = ?",
      [id_account, id_address]
    );

    if (result.affectedRows > 0) {
      return res.json({
        message: "Địa chỉ giao hàng đã được xóa thành công.",
      });
    } else {
      return res.json({
        message: "Không tìm thấy địa chỉ giao hàng hoặc xóa không thành công.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
};

const mostBuyProduct = async (req, res) => {
  try {
    let [most] = await pool.execute(
      `SELECT *, p.name_product, SUM(od.quantity) AS total_purchased,CAST((p.price - (p.price * pp.percentage / 100)) AS SIGNED) as price_reducing
      FROM product p
      JOIN order_detail od ON p.id_product = od.id_product
      JOIN orders o ON od.id_order = o.id_order
      JOIN product_promotion pp ON p.id_promotion = pp.id_promotion
      WHERE o.status = 0
      GROUP BY p.id_product
      HAVING SUM(od.quantity) > 5
      ORDER BY total_purchased DESC`
    );
    return res.status(200).json({
      listMostBuyProduct: most,
    });
  } catch (e) {
    console.log(e);
  }
};

const mostReducingProduct = async (req, res) => {
  try {
    let [most] = await pool.execute(
      `SELECT *, p.id_product, p.name_product, pp.percentage,CAST((p.price - (p.price * pp.percentage / 100)) AS SIGNED) as price_reducing
      FROM product p
      JOIN product_promotion pp ON p.id_promotion = pp.id_promotion
      WHERE pp.percentage > 25;
      `
    );
    return res.status(200).json({
      listMostReducingProduct: most,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  getOrder,
  getDetailOrder,
  detail,
  getOrderNew,
  xacNhanDonHang,
  hoanThanhDonHang,
  huyDonHang,
  xemDoanhSo,
  xemDoanhSoThang,
  datHangNew,
  orderHistory,
  orderAccount,
  getAddressDelivery,
  createAddressDelivery,
  updateAddressDelivery,
  deleteAddressDelivery,
  mostBuyProduct,
  mostReducingProduct,
};
