// backend/controllers/paymentController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const logger = require("../utils/common/logger");

/**
 * Calculate tax and shipping costs
 * @param {number} subtotal - Cart subtotal
 * @returns {Object} - Tax and shipping amounts
 */
const calculateTaxAndShipping = (subtotal) => {
  // Simple tax calculation (you might want to use a tax API in production)
  const taxRate = 0.07; // 7% tax rate
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

  // Simple shipping calculation
  // Free shipping for orders over $100, otherwise $10
  const shippingAmount = subtotal > 100 ? 0 : 10;

  return { taxAmount, shippingAmount };
};

/**
 * Create a Stripe payment intent
 */
const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { shippingInfo } = req.body;

  if (!shippingInfo) {
    return next(new AppError("Shipping information is required", 400));
  }

  // Get cart data for the current user
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // Calculate subtotal from cart
  const subtotal = cart.totalPrice;

  // Calculate tax and shipping
  const { taxAmount, shippingAmount } = calculateTaxAndShipping(subtotal);

  // Calculate total amount in cents (Stripe requires amount in smallest currency unit)
  const totalAmount = Math.round((subtotal + taxAmount + shippingAmount) * 100);

  // Create a payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    metadata: {
      userId: req.user.id.toString(),
      cartId: cart._id.toString(),
      integration_check: "accept_a_payment",
    },
    receipt_email: req.user.email,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never", // Prevent redirect-based payment methods
    },
  });

  logger.info(
    `Payment intent created for user ${req.user.id} with amount ${
      totalAmount / 100
    }`
  );

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    amount: totalAmount / 100,
    subtotal,
    taxAmount,
    shippingAmount,
  });
});

/**
 * Confirm order after successful payment
 */
const confirmOrder = catchAsync(async (req, res, next) => {
  const { paymentIntentId, shippingInfo } = req.body;

  if (!paymentIntentId || !shippingInfo) {
    return next(
      new AppError(
        "Payment intent ID and shipping information are required",
        400
      )
    );
  }

  // For testing purposes ONLY: Force succeed the payment if testing flag is provided
  if (req.query.test_mode === "true") {
    logger.info(`TEST MODE: Simulating payment success for ${paymentIntentId}`);

    // Get cart data for the current user
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart || cart.items.length === 0) {
      return next(new AppError("Your cart is empty", 400));
    }

    // Calculate subtotal, tax, and shipping
    const subtotal = cart.totalPrice;
    const { taxAmount, shippingAmount } = calculateTaxAndShipping(subtotal);
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Create new order
    const order = await Order.create({
      user: req.user.id,
      items: cart.items,
      shippingInfo,
      paymentInfo: {
        id: paymentIntentId,
        status: "succeeded",
        paymentMethod: "stripe",
      },
      taxAmount,
      shippingAmount,
      totalAmount,
      itemsPrice: subtotal,
      paidAt: new Date(),
    });

    // Clear the cart after order is confirmed
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    await cart.save();

    logger.info(
      `TEST MODE: Order ${order._id} created for user ${req.user.id}`
    );

    res.status(201).json({
      success: true,
      order,
    });
    return;
  }

  // Original code for verifying with Stripe continues here...
  // Verify the payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return next(new AppError("Payment has not been completed", 400));
  }

  // Check if this payment has already been processed
  const existingOrder = await Order.findOne({
    "paymentInfo.id": paymentIntentId,
  });

  if (existingOrder) {
    return next(new AppError("Order has already been processed", 400));
  }

  // Get cart data for the current user
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // Calculate subtotal, tax, and shipping
  const subtotal = cart.totalPrice;
  const { taxAmount, shippingAmount } = calculateTaxAndShipping(subtotal);
  const totalAmount = subtotal + taxAmount + shippingAmount;

  // Create new order
  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    shippingInfo: {
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      country: shippingInfo.country || "US",
      postalCode: shippingInfo.postalCode,
      phoneNumber: shippingInfo.phoneNumber,
    },
    paymentInfo: {
      id: paymentIntentId,
      status: "succeeded",
      paymentMethod: "stripe",
    },
    taxAmount,
    shippingAmount,
    totalAmount,
    itemsPrice: subtotal,
    paidAt: new Date(),
  });

  // Clear the cart after order is confirmed
  cart.items = [];
  cart.totalItems = 0;
  cart.totalPrice = 0;
  await cart.save();

  logger.info(`Order ${order._id} created for user ${req.user.id}`);

  res.status(201).json({
    success: true,
    order,
  });
});

/**
 * Get orders for the current user
 */
const getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});

/**
 * Get a specific order by ID
 */
const getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Ensure user can only access their own orders unless they're an admin
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new AppError("You are not authorized to access this order", 403)
    );
  }

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * Process Stripe webhook events
 */
const processWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];
  let event;

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // You need to configure Express to preserve the raw body
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return next(new AppError(`Webhook Error: ${err.message}`, 400));
  }

  // Handle different event types
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      logger.info(`PaymentIntent ${paymentIntent.id} was successful`);
      // You can trigger additional logic here, such as fulfillment processes
      break;

    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object;
      logger.warn(
        `Payment failed for PaymentIntent ${failedPaymentIntent.id}: ${
          failedPaymentIntent.last_payment_error?.message || "Unknown error"
        }`
      );
      break;

    // Add other event types as needed

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
});

/**
 * Get cart summary without creating a payment intent
 */
const getCartSummary = catchAsync(async (req, res, next) => {
  // Get cart data for the current user
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Your cart is empty", 400));
  }

  // Calculate subtotal from cart
  const subtotal = cart.totalPrice;

  // Calculate tax and shipping
  const { taxAmount, shippingAmount } = calculateTaxAndShipping(subtotal);

  // Calculate total amount
  const totalAmount = subtotal + taxAmount + shippingAmount;

  logger.info(
    `Cart summary fetched for user ${req.user.id} with amount ${totalAmount}`
  );

  res.status(200).json({
    success: true,
    amount: totalAmount,
    subtotal,
    taxAmount,
    shippingAmount,
  });
});

module.exports = {
  createPaymentIntent,
  confirmOrder,
  getMyOrders,
  getOrderById,
  processWebhook,
  getCartSummary,
};
