// backend/controllers/paymentController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const catchAsync = require("../utils/common/catchAsync");
const AppError = require("../utils/errors/AppError");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const logger = require("../utils/common/logger");
const mongoose = require("mongoose");

// Define valid country codes - must match backend/models/User.js
const VALID_COUNTRY_CODES = [
  "US",
  "CA",
  "MX",
  "AR",
  "BR",
  "GB",
  "FR",
  "DE",
  "IT",
  "ES",
  "NL",
  "BE",
  "PT",
  "CH",
  "AT",
  "SE",
  "NO",
  "DK",
  "FI",
  "AU",
  "NZ",
  "JP",
  "CN",
  "IN",
];

/**
 * Calculate tax and shipping costs
 * @param {number} subtotal - Cart subtotal
 * @returns {Object} - Tax and shipping amounts
 */
const calculateTaxAndShipping = (subtotal) => {
  // Simple tax calculation (you might want to use a tax API in production)
  const taxRate = 0.07; // 7% tax rate
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;

  // Shipping is free. shippingAmount may be updated in the future.
  const shippingAmount = 0;

  return { taxAmount, shippingAmount };
};

/**
 * Normalize shipping information to a consistent structure
 * Handles both nested and flat structures
 * @param {Object} shippingInfo - Raw shipping information object
 * @returns {Object} - Normalized shipping info
 */
const normalizeShippingInfo = (shippingInfo) => {
  if (!shippingInfo) return null;

  // Already in the normalized format
  if (
    shippingInfo.address &&
    shippingInfo.city &&
    shippingInfo.state &&
    typeof shippingInfo.address === "string"
  ) {
    return shippingInfo;
  }

  // Handle nested structure (shippingInfo.shippingAddress)
  if (shippingInfo.shippingAddress) {
    const { street, city, state, zip, postalCode, country } =
      shippingInfo.shippingAddress;
    return {
      address: street || "",
      city: city || "",
      state: state || "",
      country: country || "",
      postalCode: zip || postalCode || "",
      phoneNumber: shippingInfo.phoneNumber || "",
      name: shippingInfo.name || "",
    };
  }

  // For backward compatibility with old client formats
  return {
    address: shippingInfo.address || shippingInfo.street || "",
    city: shippingInfo.city || "",
    state: shippingInfo.state || "",
    country: shippingInfo.country || "",
    postalCode: shippingInfo.postalCode || shippingInfo.zip || "",
    phoneNumber: shippingInfo.phoneNumber || shippingInfo.phone || "",
    name: shippingInfo.name || "",
  };
};

/**
 * Validate shipping information
 * @param {Object} rawShippingInfo - Shipping information object (can be in any format)
 * @returns {Object} - Validation result with success flag and error message
 */
const validateShippingInfo = (rawShippingInfo) => {
  if (!rawShippingInfo) {
    return { success: false, message: "Shipping information is required" };
  }

  // Normalize the shipping info to a consistent structure
  const shippingInfo = normalizeShippingInfo(rawShippingInfo);

  // Log normalized shipping info for debugging
  logger.debug("Normalized shipping info", { shippingInfo });

  if (
    !shippingInfo.address ||
    !shippingInfo.city ||
    !shippingInfo.state ||
    !shippingInfo.postalCode
  ) {
    return {
      success: false,
      message: "All shipping address fields are required",
    };
  }

  if (!shippingInfo.country) {
    return { success: false, message: "Country is required" };
  }

  if (!VALID_COUNTRY_CODES.includes(shippingInfo.country)) {
    return {
      success: false,
      message: `Invalid country code: ${shippingInfo.country}. Please select a valid country.`,
    };
  }

  return { success: true, normalizedData: shippingInfo };
};

/**
 * Create a Stripe payment intent
 */
const createPaymentIntent = catchAsync(async (req, res, next) => {
  const { shippingInfo } = req.body;

  // Double-check email verification status (in case middleware is bypassed)
  if (!req.user.isEmailVerified) {
    return next(
      new AppError(
        "Email verification required. Please verify your email address before proceeding to checkout.",
        403
      )
    );
  }

  // Validate shipping information
  const shippingValidation = validateShippingInfo(shippingInfo);
  if (!shippingValidation.success) {
    return next(new AppError(shippingValidation.message, 400));
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

  // Use normalized shipping info for metadata
  const normalizedShippingInfo = shippingValidation.normalizedData;

  // Create a payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    metadata: {
      userId: req.user.id.toString(),
      cartId: cart._id.toString(),
      integration_check: "accept_a_payment",
      shippingInfo: JSON.stringify(normalizedShippingInfo),
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
 * Create an order in the database
 * Helper function used by both confirmOrder and webhook handlers
 */
const createOrderFromPaymentIntent = async (
  paymentIntentId,
  userId,
  shippingInfo = null
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new AppError("Payment has not been completed", 400);
    }

    // Check if this payment has already been processed
    const existingOrder = await Order.findOne({
      "paymentInfo.id": paymentIntentId,
    }).session(session);

    if (existingOrder) {
      // If order already exists, return it without creating a duplicate
      await session.commitTransaction();
      session.endSession();
      return existingOrder;
    }

    // Get cart data for the user
    const cart = await Cart.findOne({ user: userId }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Calculate subtotal, tax, and shipping
    const subtotal = cart.totalPrice;
    const { taxAmount, shippingAmount } = calculateTaxAndShipping(subtotal);
    const totalAmount = subtotal + taxAmount + shippingAmount;

    // Determine shipping information
    // First use provided shipping info, then try to get it from payment intent metadata
    let rawShippingInfo = shippingInfo;

    if (!rawShippingInfo && paymentIntent.metadata.shippingInfo) {
      try {
        rawShippingInfo = JSON.parse(paymentIntent.metadata.shippingInfo);
      } catch (error) {
        logger.error("Error parsing shipping info from payment intent", {
          error: error.message,
          shippingInfo: paymentIntent.metadata.shippingInfo,
        });
        throw new AppError("Invalid shipping information format", 400);
      }
    }

    if (!rawShippingInfo) {
      throw new AppError("Shipping information is required", 400);
    }

    // Validate and normalize shipping information
    const shippingValidation = validateShippingInfo(rawShippingInfo);
    if (!shippingValidation.success) {
      throw new AppError(shippingValidation.message, 400);
    }

    // Use the normalized shipping info for the order
    const normalizedShippingInfo = shippingValidation.normalizedData;

    // Create an order
    const order = await Order.create(
      [
        {
          user: userId,
          items: cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            image: item.image,
          })),
          shippingInfo: {
            address: normalizedShippingInfo.address,
            city: normalizedShippingInfo.city,
            state: normalizedShippingInfo.state,
            country: normalizedShippingInfo.country,
            postalCode: normalizedShippingInfo.postalCode,
            phoneNumber: normalizedShippingInfo.phoneNumber || "",
          },
          paymentInfo: {
            id: paymentIntentId,
            status: paymentIntent.status,
            paymentMethod: "stripe",
          },
          taxAmount,
          shippingAmount,
          totalAmount,
          itemsPrice: subtotal,
          paidAt: new Date(),
        },
      ],
      { session }
    );

    // Clear the cart after order is created
    await Cart.findOneAndDelete({ user: userId }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (error) {
    // Abort transaction if any error occurs
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Confirm order after successful payment
 */
const confirmOrder = catchAsync(async (req, res, next) => {
  const { paymentIntentId, shippingInfo } = req.body;

  // Double-check email verification status (in case middleware is bypassed)
  if (!req.user.isEmailVerified) {
    return next(
      new AppError(
        "Email verification required. Please verify your email address before proceeding to checkout.",
        403
      )
    );
  }

  if (!paymentIntentId) {
    return next(new AppError("Payment intent ID is required", 400));
  }

  try {
    // Create order with the order helper function
    // This will validate the shipping info and normalize it
    const order = await createOrderFromPaymentIntent(
      paymentIntentId,
      req.user.id,
      shippingInfo
    );

    logger.info(`Order ${order._id} confirmed by user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    logger.error(`Error confirming order: ${error.message}`, {
      userId: req.user.id,
      paymentIntentId,
      error: error.stack,
    });

    // Provide a helpful error message based on the type of error
    let errorMessage = "Failed to create order. Please contact support.";
    let statusCode = 500;

    if (error.message.includes("shipping")) {
      errorMessage = `Shipping information problem: ${error.message}`;
      statusCode = 400;
    } else if (error.message.includes("Payment")) {
      errorMessage = `Payment issue: ${error.message}`;
      statusCode = 400;
    }

    return next(new AppError(errorMessage, statusCode));
  }
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

  // Add debug logging
  logger.info(
    `Received webhook request with signature: ${
      signature ? "present" : "missing"
    }`
  );
  logger.info(`Raw body type: ${req.rawBody ? typeof req.rawBody : "missing"}`);

  if (!signature) {
    logger.error("Webhook Error: No signature header");
    return res.status(400).json({ error: "No signature header" });
  }

  if (!req.rawBody) {
    logger.error("Webhook Error: No raw body available");
    return res.status(400).json({ error: "No raw body available" });
  }

  // Verify webhook signature
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody, // This is now a Buffer which is what Stripe expects
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    logger.info(
      `Successfully verified webhook signature for event type: ${event.type}`
    );
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        logger.info(`PaymentIntent ${paymentIntent.id} was successful`);

        // Extract the user ID from metadata
        const userId = paymentIntent.metadata.userId;

        if (userId) {
          // Try to create an order as a fallback if the client-side confirmation failed
          try {
            // Check if order already exists
            const existingOrder = await Order.findOne({
              "paymentInfo.id": paymentIntent.id,
            });

            if (!existingOrder) {
              logger.info(
                `Creating order from webhook for payment ${paymentIntent.id}`
              );
              await createOrderFromPaymentIntent(paymentIntent.id, userId);
              logger.info(
                `Successfully created order from webhook for payment ${paymentIntent.id}`
              );
            } else {
              logger.info(
                `Order already exists for payment ${paymentIntent.id}, skipping creation`
              );
            }
          } catch (orderError) {
            logger.error(
              `Error creating order from webhook: ${orderError.message}`
            );
            // We don't rethrow here because we want to acknowledge receipt of the webhook
          }
        } else {
          logger.warn(
            `PaymentIntent ${paymentIntent.id} is missing userId in metadata`
          );
        }
        break;

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object;
        logger.warn(
          `Payment failed for PaymentIntent ${failedPaymentIntent.id}: ${
            failedPaymentIntent.last_payment_error?.message || "Unknown error"
          }`
        );
        break;

      // Handle charge events
      case "charge.succeeded":
        logger.info(
          `Charge succeeded for PaymentIntent ${event.data.object.payment_intent}`
        );
        break;

      case "charge.failed":
        logger.warn(
          `Charge failed for PaymentIntent ${event.data.object.payment_intent}`
        );
        break;

      // Add other relevant events
      case "charge.refunded":
        // Update order status to refunded
        const refundedCharge = event.data.object;

        if (refundedCharge.payment_intent) {
          const order = await Order.findOne({
            "paymentInfo.id": refundedCharge.payment_intent,
          });
          if (order) {
            order.orderStatus = "Cancelled";
            order.refundedAt = new Date();
            await order.save();
            logger.info(
              `Order updated to Cancelled due to refund for payment ${refundedCharge.payment_intent}`
            );
          }
        }
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    logger.error(`Error processing webhook event: ${err.message}`);
    // Don't return an error response, just log it
  }

  // Always acknowledge receipt of the event to prevent Stripe from retrying
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
