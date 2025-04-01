# Utils Directory

This directory contains utility functions and helpers organized into logical subfolders that provide common functionality across the application. These utilities help maintain a DRY (Don't Repeat Yourself) codebase and provide standardized implementations for common tasks.

## Directory Structure

- **emails/** - Email handling utilities including sending functionality and templates
- **errors/** - Custom error handling classes and middleware
- **common/** - General-purpose utilities for common tasks
- **logs/** - Directory for log storage and logging-related utilities

## When to Use Utils

- When you need to abstract away complex or repetitive logic
- When functionality is needed across multiple modules
- When you want to standardize certain operations like error handling or logging

## Usage Guidelines

- Keep utility functions focused on a single responsibility
- Ensure proper error handling and logging within utils
- Unit test all utility functions thoroughly
- Document function parameters and return values with JSDoc comments

## Related Documentation

For more details about each utility category, see the individual README files in each subfolder.
