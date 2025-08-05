# Planespotting Gallery

A full-stack web application for managing and showcasing planespotting photography. Built with React frontend and Node.js/Express backend, featuring user authentication, photo uploads with watermarking capabilities, and a responsive gallery interface.

## Features

### Core Functionality
- **Photo Gallery**: Grid-based layout displaying planespotting photos with pagination
- **Photo Upload**: Secure file upload system with preview functionality
- **User Authentication**: Login/logout system with session management
- **Photo Management**: Delete photos with confirmation dialogs
- **Responsive Design**: Mobile-friendly interface that adapts to different screen sizes

### Advanced Features
- **Watermarking**: Add custom watermarks to uploaded photos with configurable positioning
- **Theme Switching**: Light/dark mode toggle with system preference detection
- **Image Zoom**: Click to view full-size photos in modal overlay
- **Toast Notifications**: User feedback for actions and errors
- **Photo Metadata**: Alt text and descriptions for accessibility and context

## Technology Stack

### Frontend
- **React**: With hooks for state management
- **Vite**: Fast build tool and development server
- **React Icons**: Comprehensive icon library (FontAwesome, Radix)
- **Vanilla CSS**: For theming
- **JavaScript**: ES6+ features and async/await

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Express Session**: Session management for authentication
- **File Upload Handling**: Multipart form data processing
- **Static File Serving**: Image delivery and asset management

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm 

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd planespotting-app
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Create required directories**
   ```bash
   mkdir -p uploads
   mkdir -p public/images
   ```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=773
SESSION_SECRET=your-secure-session-secret-here
NODE_ENV=development
```

### Authentication Setup
The application uses hardcoded credentials for demonstration purposes. In a production environment, implement proper user management with hashed passwords and database storage.


## Usage

### Development Mode

1. **Start the backend server**
   ```bash
   npm run server
   ```
   Server will run on `http://localhost:773`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

### Production Build

1. **Build the frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Serve the application**
   ```bash
   npm start
   ```

## API Endpoints

### Public Endpoints
- `GET /api/photos` - Retrieve paginated photos
- `GET /images/:filename` - Serve uploaded images
- `GET /check-auth` - Check authentication status

### Protected Endpoints
- `POST /login` - User authentication
- `POST /logout` - User logout
- `POST /upload` - Photo upload with metadata
- `DELETE /api/photos/:filename` - Delete specific photo

## File Structure

```
planespotting-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Application styles
│   │   └── main.jsx       # React entry point
│   ├── public/
│   │   └── watermark.png  # Watermark image
│   └── package.json       # Frontend dependencies
├── server/                # Backend server files
├── uploads/               # Uploaded photo storage
├── public/images/         # Processed images
├── package.json          # Backend dependencies
└── README.md             # This file
```

## Features in Detail

### Photo Upload Process
1. User selects image file through file input
2. Preview displays with optional watermark overlay
3. User adds alt text and description
4. Confirmation dialog ensures intentional upload
5. Server processes image and applies watermark if requested
6. Photo added to gallery with metadata

### Watermark System
- Five positioning options: top-left, top-right, center, bottom-left, bottom-right
- Configurable opacity and size
- Preview functionality before upload
- Non-destructive application (original preserved)

### Theme System
- Automatic detection of system color scheme preference
- Manual toggle between light and dark modes
- Persistent theme selection via localStorage
- CSS custom properties for consistent theming
- Smooth transitions between theme changes

### Authentication Flow
- Session-based authentication with Express Session
- Secure credential validation
- Protected routes for upload and delete operations
- Automatic session persistence across browser sessions
- Keyboard shortcut for quick access

## Security Features

- Session-based authentication
- CSRF protection through same-origin policy
- File type validation for uploads
- Secure file serving with proper headers
- Input sanitization for metadata fields

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
