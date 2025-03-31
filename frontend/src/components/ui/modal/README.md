# Modal Component

A reusable, accessible modal component for React applications.

## Features

- Fully customizable through props
- Focus trap for accessibility
- Close on ESC key press
- Close on overlay click
- Portal rendering for proper stacking
- Scroll lock to prevent background scrolling
- Animation support
- Responsive design

## Usage

```jsx
import Modal from "components/ui/modal";

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button onClick={handleOpen}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="My Modal Title"
        className="custom-modal-class"
      >
        <p>Modal content goes here!</p>
        <button onClick={handleClose}>Close</button>
      </Modal>
    </>
  );
};
```

## Props

| Prop                  | Type       | Default  | Description                                                 |
| --------------------- | ---------- | -------- | ----------------------------------------------------------- |
| `isOpen`              | `boolean`  | Required | Controls the visibility of the modal                        |
| `onClose`             | `function` | Required | Function called when the modal should close                 |
| `title`               | `node`     | -        | The title displayed in the modal header                     |
| `children`            | `node`     | Required | The content of the modal                                    |
| `className`           | `string`   | `''`     | Additional CSS class for the modal container                |
| `closeOnEscape`       | `boolean`  | `true`   | Whether the modal should close when pressing the ESC key    |
| `closeOnOverlayClick` | `boolean`  | `true`   | Whether the modal should close when clicking on the overlay |

## Styling

Use the following CSS classes to customize the modal:

- `.modal__overlay` - The overlay background
- `.modal__container` - The modal container
- `.modal__header` - The header section containing title and close button
- `.modal__title` - The modal title
- `.modal__close-btn` - The close button
- `.modal__content` - The content area of the modal

## Accessibility

The modal component follows accessibility best practices:

- Traps focus within the modal when open
- Supports keyboard navigation
- Proper ARIA attributes
- Restores focus on close
