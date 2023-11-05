const messageUser = {
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",
  error: "Đã xảy ra lỗi",
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",

  // Auths
  // Login
  infoEmpty: "Bạn đã nhập thiếu email hoặc mật khẩu",
  notExistEmail: "Email chưa được đăng ký!",
  wrongPassword: "Bạn đã nhập sai mật khẩu! Vui lòng thử lại",
  blockEmail:
    "Tài khoản đã bị khóa. Vui lòng donate cho quản trị viên để được mở khoá",
  successLogin: "Đăng nhập thành công!",

  //Sign in
  duplicateEmail: "Email đã được đăng ký! Vui lòng sử dụng email khác",
  successRegister: "Đăng ký tài khoản thành công!",

  //Change Password
  oldPasswordInvalid: "Mật khẩu cũ không chính xác",
  notNewPassword: "Mật khẩu không khớp",
  successChangePassword: "Đổi mật khẩu thành công",

  //Change Information
  successChangeInfo: "Thay đổi thông thông tin thành công",

  //Forgot Password
  emptyEmail: "Vui lòng nhập email",
  emptyPassword: "Vui lòng nhập mật khẩu",
  notFoundUser: "Email không tồn tại trong hệ thống!",
  sentEmailVerification: "Đã gửi mã xác nhận đến email của bạn",
  overTimeVerification: "Mã xác minh đã hết hiệu lực",
  InvalidVerification: "Mã xác thực không chính xác",
  successVerification: "Mã xác nhận chính xác. Mời bạn nhập mật khẩu mới",
  InvalidConfirmPassword: "Mật khẩu xác nhận không khớp",
  successResetPassword: "Khôi phục mật khẩu thành công",

  //Block User
  successBlockUser:
    "Khoá tài khoản thành công và đã gửi thông báo đến email đăng ký tài khoản",
  //UnBlock User
  successUnBlockUser:
    "Mở Khoá tài khoản thành công và đã gửi thông báo đến email đăng ký tài khoản",
};

const messageCategory = {
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",
  error: "Đã xảy ra lỗi",

  // Add Category
  existNameAddCategory: "Thêm thất bại. Tên danh mục đã tồn tại",
  successAddNewCategory: "Thêm mới danh mục thành công",

  //Updat Category
  existNameUpdateCategory: "Cập nhật thất bại. Tên danh mục đã tồn tại",
  successUpdateCategory: "Cập nhật danh mục thành công",

  //Remove Category
  existProductInCategory: "Không thể xoá vì đã có sản phẩm trong danh mục này.",
  successDeleteCategory: "Đã xoá thành công danh mục này",
};

const messageProduct = {
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",
  error: "Đã xảy ra lỗi",

  // Add Product
  existNameAddProduct: "Thêm thất bại. Tên sản phẩm đã tồn tại",
  successAddNewProduct: "Thêm mới sản phẩm thành công",

  //Updat Product
  existNameUpdateProduct: "Cập nhật thất bại. Tên sản phẩm đã tồn tại",
  successUpdateProduct: "Cập nhật sản phẩm thành công",

  //Remove Product
  existProductInCart:
    "Không thể xoá vì sản phẩm này đã được thêm vào giỏ hàng hoặc đã được đặt hàng.",
  successDeleteProduct: "Đã xoá thành công sản phẩm này",
};

const messagePublishing = {
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",
  error: "Đã xảy ra lỗi",

  // Add Publishing
  existNameAddPublishing: "Thêm thất bại. Tên nhà xuất bản đã tồn tại",
  successAddNewPublishing: "Thêm mới nhà xuất bản thành công",

  //Updat Publishing
  existNameUpdatePublishing: "Cập nhật thất bại. Tên nhà xuất bản đã tồn tại",
  successUpdatePublishing: "Cập nhật nhà xuất bản thành công",

  //Remove Publishing
  existProductInPublishing:
    "Không thể xoá vì nhà xuất bản này đã xuất bản sách.",
  successDeletePublishing: "Đã xoá thành công nhà xuất bản này",
};

const messageDiscount = {
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",
  error: "Đã xảy ra lỗi",

  // Add Product Promotion
  existPercentageAddProductPromotion:
    "Thêm thất bại. Phần trăm giảm giá sách đã tồn tại",
  successAddNewProductPromotion: "Thêm mới giảm giá sách thành công",

  //Update ProductPromotion
  existPercentageUpdateProductPromotion:
    "Cập nhật thất bại. Phần trăm giảm giá sách đã tồn tại",
  successUpdateProductPromotion: "Cập nhật giảm giá sách thành công",

  //Remove ProductPromotion
  usedProductPromotion:
    "Không thể xoá vì phần trăm giảm giá sách này đã được sử dụng",
  successDeleteProductPromotion: "Đã xoá thành công phần trăm giảm giá sách",

  // Add Discount
  existCodeAddDiscount: "Thêm thất bại. Mã giảm giá đã tồn tại",
  successAddNewDiscount: "Thêm mới nhà xuất bản thành công",

  //Updat Discount
  existCodeUpdateDiscount: "Cập nhật thất bại. Mã giảm giá đã tồn tại",
  successUpdateDiscount: "Cập nhật nhà xuất bản thành công",

  //Remove Discount
  usedDiscount: "Không thể xoá vì mã giảm giá này đã được sử dụng",
  successDeleteDiscount: "Đã xoá thành công mã giảm giá này",

  //Find Discount By Code
  notFoundDiscount: "Mã giảm giá không tồn tại",
  invalidDiscount: "Mã giảm giá không hợp lệ hoặc đã hết hạn sử dụng",
};

const messageDeliveryAddress = {
  infosEmpty: "Vui lòng nhập đầy đủ thông tin",
  error: "Đã xảy ra lỗi",

  // Add Product Promotion
  existAddressDelivery: "Thêm thất bại. Địa chỉ giao hàng đã tồn tại",
  successAddNewAddressDelivery: "Thêm mới đại chỉ giao hàng thành công",

  //Updat ProductPromotion
  existAddressDelivery: "Cập nhật thất bại. Địa chỉ giao hàng đã tồn tại",
  successUpdateAddressDelivery: "Cập nhật đại chỉ giao hàng thành công",

  //Remove ProductPromotion
  usedAddressDelivery: "Không thể xoá vì địa chỉ giao hàng này đã được sử dụng",
  successDeleteAddressDelivery: "Đã xoá thành công địa chỉ giao hàng này",
};

const messageCart = {
  error: "Đã xảy ra lỗi",
  notExistProductInCart: "Sản phẩm không tồn tại",

  nullProductPay: "Chưa có sản phẩm để thanh toán",

  //Add Product Into Cart
  overZeroQuantity: "Số lượng sản phẩm phải lớn hơn 0",
  successAddProductIntoCart: "Thêm vào giỏ hàng thành công",

  //Delete Product From Cart
  successDeleteProductFromCart: "Đã xoá sản phẩm khỏi giỏ hàng",

  //DecrementProductFromCart
  successDecrementProductFromCart:
    "Giảm thành công số lượng sản phẩm trong giỏ hàng",

  //IncrementProductFromCart
  successIncrementProductFromCart:
    "Tăng thành công số lượng sản phẩm trong giỏ hàng",
};

const messageOrder = {
  error: "Đã xảy ra lỗi",

  nullProductInCart: "Giỏ hàng trống nên không thể đặt hàng",
  nullDeliveryAddress:
    "Không thể đặt hàng vì địa chỉ nhận hàng trống. Vui lòng thêm địa chỉ nhận hàng",
  failPay: "Đặt hàng thất bại",
  successPay: "Đặt hàng thành công",
  successConfirmOrder: "Đơn hàng đã được xác nhận thành công",
  successCompleteOrder: "Đơn hàng đã hoàn thành",
  cancelOrder: "Đơn hàng đã bị huỷ",
};

module.exports = {
  messageUser,
  messageCategory,
  messageProduct,
  messagePublishing,
  messageDiscount,
  messageDeliveryAddress,
  messageCart,
  messageOrder,
};
