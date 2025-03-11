# MERN Stack E-Commerce Website

This repository contains a full-stack e-commerce website built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. The project was developed as part of my learning journey to understand the MERN stack and e-commerce application development.

As I went through the process of creating this website, I saw MANY issues, bad coding practices, etc. I will save this version of the website here to serve as a comparison and create a new repository where I will completely rebuild the backend (it's just one simple index.js right now which is not good at all), including real user authentication and payment system.

There are also many improvements to make to the frontend shop (having different pictures, filtering, fix the cart functionality), and to the admin panel (user management, product editing, improved product creation, filtering, etc).

## Project Overview

This e-commerce platform includes:

- User-facing storefront with product browsing, and shopping cart functionality.
- User authentication system.
- Admin panel for product management.
- Responsive design for various screen sizes.

## Project Structure

The project is organized into three main directories:

### Frontend

The client-side React application that users interact with.

- Built with React.js and React Router for navigation
- Context API for state management (shopping cart, user authentication)
- Responsive CSS for mobile and desktop views
- Key components:
  - Navbar with cart indicator
  - Product listings with filtering by category
  - Product detail pages
  - Shopping cart functionality
  - User authentication (login/signup)

### Backend

The server-side Express.js application that handles API requests.

- RESTful API endpoints for products, users, and cart operations
- MongoDB integration using Mongoose
- JWT authentication for secure user sessions
- File upload functionality for product images

### Admin

A separate React application for administrative functions.

- Product management (add, edit, delete)
- Simple dashboard interface
- Secure admin-only access

## Technologies Used

- **Frontend**:
  - React.js
  - React Router
  - Context API
  - CSS3
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT (JSON Web Tokens)
  - Multer (for file uploads)
- **Development Tools**:
  - Git for version control
  - npm for package management

## Features

- **Product Browsing**: Users can view all products or filter by categories (men, women, kids)
- **Product Details**: Detailed view of each product with description and pricing
- **Shopping Cart**: Add/remove items, adjust quantities, view total
- **User Authentication**: Sign up and login functionality with JWT
- **Responsive Design**: Mobile-friendly interface
- **Admin Panel**: Manage products (add, edit, delete)

## Installation and Setup

### Prerequisites

- Node.js and npm installed
- MongoDB account (local or Atlas)

### Setup Instructions

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/e-commerce-mern-stack.git
   cd e-commerce-mern-stack
   ```

2. Backend setup:

   ```
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory with:

   ```
   DB_USERNAME=your_mongodb_username
   DB_PASSWORD=your_mongodb_password
   JWT_SECRET=your_jwt_secret
   ```

3. Frontend setup:

   ```
   cd ../frontend
   npm install
   ```

4. Admin panel setup:

   ```
   cd ../admin
   npm install
   ```

5. Running the application:
   - Start the backend server:
     ```
     cd backend
     npm start
     ```
   - Start the frontend application:
     ```
     cd frontend
     npm start
     ```
   - Start the admin panel:
     ```
     cd admin
     npm start
     ```

## Future Improvements

This project was built as a learning exercise and has several areas for improvement:

- Implement proper error handling throughout the application
- Add product search functionality
- Improve cart management and checkout process
- Add payment gateway integration
- Enhance security features
- Implement user profiles and order history
- Add product reviews and ratings
- Optimize database queries and frontend performance
- Implement testing (unit tests, integration tests)

## Learning Outcomes

Through this project, I gained experience with:

- Building full-stack applications with the MERN stack (not advanced enough to my taste)
- Managing state in React applications
- Creating and consuming RESTful APIs (but with only one file for the backend which is not acceptable)
- Implementing authentication and authorization (no password security currently and no 2FA so it's more to show how to modify frontend based on logged status)
- File uploads and management (Need to add functionality for several different images and use a proper image picker)
- Database design and integration (Very basic IMO)
- Responsive web design (That part was actually good even though there are some improvements to make)

## Acknowledgements

This project was developed as part of a learning course on MERN stack development. Special thanks to the course instructors GreatStack (Youtuber) and the open-source community for their valuable resources and support.
