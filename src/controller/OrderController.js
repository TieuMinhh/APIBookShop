import { request } from "express";
import pool from "../configs/connectDatabse";
import auth from "../middleware/auth";
import { messageOrder } from "../../message";

//Xem đơn đặt hàng
//note ý tưởng
//insert into order_detail(id_product,mount) values(?,?) where id_account=token
//Chức năng thanh toán
let pay = async (req, res) => {
  try {
    let id_account = auth.tokenData(req).id_account;
    //select name,price,images from cart c,product p where c.id_account=id_account and c.id_product =p.id_product
    console.log("id account: ", id_account);
    let check = await checkCart(id_account);
    console.log("Check exist", check.exist);
    if (!check.exist) {
      return res.status(200).json({
        message: messageOrder.nullProductInCart,
      });
    }

    let listProduct = await selectAccount(id_account);
    console.log(">>>> Check list: ", listProduct);
    let totalPrice = 0;

    for (let i in listProduct) {
      let productPrice = listProduct[i].quantity * listProduct[i].price;
      totalPrice += productPrice;
    }

    let deleteProduct = await pool.execute(
      "delete from cart where id_account= ?",
      [id_account]
    );

    return res.status(200).json({
      total: totalPrice,
    });
  } catch (err) {
    console.log(err);
  }
};

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
  let id_address = req.body.id_address;
  let check = await checkCart(id_account);

  if (!id_address) {
    return res.status(200).json({
      errCode: 2,
      message: messageOrder.nullDeliveryAddress,
    });
  }

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
          errCode: 0,
          message: messageOrder.successPay,
        });
      } else {
        return res.status(200).json({
          errCode: 1,
          message: messageOrder.failPay,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: messageOrder.failPay,
      });
    }
  } else {
    return res.status(400).json({
      message: messageOrder.nullProductInCart,
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

const detail = async (id_order) => {
  try {
    const [details] = await pool.execute(
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
            'original_price', temp_result.price,
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
        a.id_order = ?
    ORDER BY
        b.order_time DESC
) AS temp_result
LEFT JOIN
    account a ON temp_result.id_account = a.id_account
LEFT JOIN
    delivery_address da ON temp_result.id_account = da.id_account
GROUP BY temp_result.id_order, temp_result.order_time, temp_result.id_account, temp_result.status, temp_result.discount_id, a.name, a.address, a.phone, temp_result.percentage, da.id_address, da.name_address, da.name_receiver, da.phone_receiver;

      `,
      [id_order]
    );

    if (details.length === 0) {
      return "Chi tiết đơn hàng không tồn tại";
    } else {
      const listOrder = details.map((row) => ({
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

      return listOrder;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

let getDetailOrder = async (req, res) => {
  let { id_order } = req.params;
  try {
    let details = await detail(id_order);
    let total = 0;
    let shipFee = 20000;

    if (Array.isArray(details)) {
      details.forEach((order) => {
        let percentage = order.discount_percentage || 0; // Giả sử discount_percentage là thuộc tính được trả về từ câu truy vấn
        console.log("giảm giá:", percentage);
        order.products.forEach((product) => {
          total +=
            product.quantity * product.price_reducing -
            (product.quantity * product.price_reducing * percentage) / 100;
        });
      });
    }

    return res.status(200).json({
      listOrderDetail: details,
      total: total + shipFee,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng",
    });
  }
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

let confirmOrder = (req, res) => {
  try {
    let id_order = req.params.id_order;
    let update = pool.execute(
      "UPDATE orders SET status = 2 WHERE id_order = ?",
      [id_order]
    );
    return res.status(200).json({
      errCode: 0,
      message: messageOrder.successConfirmOrder,
    });
  } catch (e) {
    console.log(e);
  }
};

let completeOrder = async (req, res) => {
  try {
    let { id_order } = req.params;
    let details = await detail(id_order);
    let total = 0;
    let shipFee = 20000;

    if (Array.isArray(details)) {
      details.forEach((order) => {
        let percentage = order.discount_percentage || 0;
        order.products.forEach((product) => {
          total +=
            product.quantity * product.price_reducing -
            (product.quantity * product.price_reducing * percentage) / 100;
        });
      });
    }

    total += shipFee; // Tính phí ship

    await pool.execute("INSERT INTO revenue(id_order,total) VALUES(?,?)", [
      id_order,
      total,
    ]);
    await pool.execute("UPDATE orders SET status = 0 WHERE id_order = ?", [
      id_order,
    ]);

    return res.status(200).json({
      total,
      errCode: 0,
      message: messageOrder.successCompleteOrder,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 1,
      message: messageOrder.error,
    });
  }
};

let cancelOrder = (req, res) => {
  try {
    let id_order = req.params.id_order;
    let update = pool.execute(
      "UPDATE orders SET status = 3 WHERE id_order = ?",
      [id_order]
    );
    return res.status(200).json({
      errCode: 0,
      message: messageOrder.cancelOrder,
    });
  } catch (e) {
    console.log(e);
  }
};

let getRevenue = async (req, res) => {
  let year = req.query?.year || 2023;

  try {
    let [listRevenue] = await pool.execute(
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

    return res.status(200).json({
      listRevenue: listRevenue,
    });
  } catch (error) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi truy vấn cơ sở dữ liệu",
    });
  }
};

let getRevenueByMonths = async (req, res) => {
  let month = req.params?.month;
  let year = req.params?.year;
  //let details = await detail(id_order)
  console.log("Hello");
  // let [listDoanhSo] = await pool.execute('SELECT * FROM doanhthu d,orders o where d.id_order=o.id_order')
  let [listRevenueByMonths] = await pool.execute(
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
  console.log(listRevenueByMonths);
  return res.status(200).json({
    // detailOrder: details
    listRevenueByMonths: listRevenueByMonths,
  });
};

let getRevenueByDateToDate = async (req, res) => {
  let fromDate = req.params?.fromDate; // Đầu vào: fromDate và toDate là ngày bạn muốn tính doanh thu
  let toDate = req.params?.toDate; // Đầu vào: fromDate và toDate là ngày bạn muốn tính doanh thu

  try {
    let [revenue] = await pool.execute(
      `SELECT SUM(d.total) AS total_revenue
      FROM orders o
      JOIN revenue d ON o.id_order = d.id_order
      WHERE DATE(o.order_time) BETWEEN ? AND ?`,
      [fromDate, toDate]
    );

    return res.status(200).json({
      totalRevenue: revenue[0].total_revenue || 0,
    });
  } catch (error) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu:", error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi truy vấn cơ sở dữ liệu",
    });
  }
};

const getSuccessfulOrdersByDateToDate = async (req, res) => {
  const fromDate = req.params.fromDate;
  const toDate = req.params.toDate;
  const status = req.params.status;
  try {
    const [result] = await pool.execute(
      `SELECT COUNT(*) AS total_orders_by_status
      FROM orders
      WHERE orders.status = ? 
      AND DATE(orders.order_time) BETWEEN ? AND ?`,
      [status, fromDate, toDate]
    );

    return res.status(200).json({
      ordersCount: result[0].total_orders_by_status || 0,
    });
  } catch (error) {
    console.error(messageOrder.error);
    return res.status(500).json({
      message: messageOrder.error,
    });
  }
};

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
    let id_account = auth.tokenData(req).id_account;
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

const getQuantitySuccessOrders = async (req, res) => {
  try {
    // const id_account = req.params.id_account;
    const [response] = await pool.execute(
      `SELECT
      a.id_account,
      a.name AS account_name,
      SUM(CASE WHEN o.status = 0 THEN 1 ELSE 0 END) AS successful_orders
    FROM
      account a
    LEFT JOIN
      orders o ON a.id_account = o.id_account
    WHERE a.id_account = ?
    GROUP BY a.id_account, a.name;
      `,
      [auth.tokenData(req).id_account]
    );

    return res.status(200).json({
      successfulOrders: response,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTotalOrderPay = async (req, res) => {
  try {
    const idAccount = auth.tokenData(req).id_account;
    const [response] = await pool.execute(
      `SELECT 
      orders.id_order,
      SUM(
        (od.quantity * p.price) - 
        (od.quantity * p.price * 
          (
            IFNULL((pp.percentage + IFNULL(d.percentage, 0)), 0)
          ) / 100
        ) + 20000
      ) AS total_price
    FROM 
      order_detail od
    JOIN 
      orders ON od.id_order = orders.id_order
    JOIN 
      product p ON od.id_product = p.id_product
    LEFT JOIN 
      product_promotion pp ON p.id_promotion = pp.id_promotion
    LEFT JOIN 
      discount d ON orders.discount_id = d.discount_id
    WHERE 
      orders.status = 0
    GROUP BY 
      orders.id_order;
      `,
      [idAccount]
    );

    return res.status(200).json({
      totalOrdersPay: response,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

let getDetailOrderAndTotal = async (req, res) => {
  const { id_order } = req.params;
  try {
    const orderDetails = await getDetailOrder(id_order);
    const totalOrdersPay = await getTotalOrderPay();

    if (Array.isArray(orderDetails.details)) {
      return res.status(200).json({
        listOrderDetail: orderDetails.details,
        total: orderDetails.total,
        totalOrdersPay,
      });
    } else {
      return res.status(500).json({
        message:
          "Đơn hàng không tồn tại hoặc có lỗi xảy ra khi lấy chi tiết đơn hàng",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy chi tiết đơn hàng và tính tổng",
    });
  }
};

const TotalSoldProducts = async () => {
  try {
    const [results] = await pool.execute(`
      SELECT SUM(od.quantity) AS total_sold
      FROM orders o
      JOIN order_detail od ON o.id_order = od.id_order
      WHERE o.status = 0;
    `);

    const totalSoldProduct = results[0].total_sold || 0;
    return totalSoldProduct;
  } catch (error) {
    throw error;
  }
};

const getTotalSoldProducts = async (req, res) => {
  try {
    const totalSold = await TotalSoldProducts();
    res.status(200).json({ totalSoldProducts: totalSold });
  } catch (error) {
    res.status(500).json({ error: "Đã xảy ra lỗi khi lấy dữ liệu" });
  }
};

const totalNewOrdersToday = async () => {
  try {
    const [results] = await pool.execute(`
      SELECT COUNT(*) AS completedOrdersCount
      FROM orders
      WHERE DATE(order_time) = CURDATE() AND status = 1;
    `);

    const completedOrdersCount = results[0].completedOrdersCount || 0;
    return completedOrdersCount;
  } catch (error) {
    console.error(messageOrder.error);
    throw error;
  }
};

const getTotalNewOrdersToday = async (req, res) => {
  try {
    const totalTodayOrders = await totalNewOrdersToday();
    res.status(200).json({ totalTodayOrders: totalTodayOrders });
  } catch (error) {
    res.status(500).json({ error: messageOrder.error });
  }
};

const newCustomersToday = async () => {
  try {
    const [results] = await pool.execute(`
      SELECT COUNT(*) AS newCustomersToday
      FROM account
      WHERE DATE(created_time) = CURDATE();
    `);

    const newCustomersCount = results[0].newCustomersToday || 0;
    return newCustomersCount;
  } catch (error) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu:", error);
    throw error;
  }
};

const getNewCustomerToday = async (req, res) => {
  try {
    const newCustomers = await newCustomersToday();
    res.status(200).json({ newCustomersToday: newCustomers });
  } catch (error) {
    res.status(500).json({ error: messageOrder.error });
  }
};

module.exports = {
  pay,
  getOrder,
  getDetailOrder,
  detail,
  getOrderNew,
  confirmOrder,
  completeOrder,
  cancelOrder,
  getRevenue,
  getRevenueByMonths,
  getRevenueByDateToDate,
  datHangNew,
  orderHistory,
  orderAccount,
  getQuantitySuccessOrders,
  getDetailOrderAndTotal,
  getSuccessfulOrdersByDateToDate,
  getTotalSoldProducts,
  getTotalNewOrdersToday,
  getNewCustomerToday,
};
