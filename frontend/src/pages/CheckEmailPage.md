# Check Email Page

This page informs users to check their mailbox to verify their email address. It's designed to be shown after user registration or when email verification is required.

## Features

- **Email confirmation message** - Clear instructions for users
- **Resend verification email** - Allow users to request another verification email
- **Email address display** - Shows the email address that needs verification (via URL parameter)
- **Visual feedback** - Success/error messages for resend attempts
- **Navigation links** - Easy access to login page
- **Help section** - Contact information for support

## Usage

### After Registration

When a user successfully registers, redirect them to the check email page:

```typescript
// In RegisterPage.tsx - after successful registration
navigate(`/check-email?email=${encodeURIComponent(userData.email)}`);
```

### Manual Navigation

Users can be directed to the page manually:

```typescript
// Direct navigation
navigate("/check-email?email=user@example.com");
```

### URL Structure

```
/check-email?email=user@example.com
```

## API Integration

The page includes functionality to resend verification emails:

- **Endpoint**: `POST /auth/resend-verification`
- **Payload**: `{ email: string }`
- **Success**: Shows success message
- **Error**: Displays error message with retry option

## Styling

The page follows the same design system as other auth pages:

- Dark gradient background
- Card-based layout
- Red/purple gradient branding
- Responsive design
- Accessible form elements

## Error Handling

- Network errors are caught and displayed
- Invalid email addresses are handled
- Server errors show appropriate messages
- Rate limiting and other server responses are managed

## Components Used

- React Router for navigation
- Axios for API calls
- React Icons for visual elements
- Tailwind CSS for styling

## Future Enhancements

- Email verification status checking
- Countdown timer for resend attempts
- Different email providers quick links
- Email client detection and deep linking
