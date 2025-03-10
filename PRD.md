# Meal Planner Website - Product Requirements Document (PRD)

## Overview

A web-based meal planning application that allows users to plan their weekly meals for breakfast, lunch, and dinner. Users can organize their meal schedule and export it to PDF format. The application uses Firebase for persistent storage.

## Tech Stack

- Frontend: React.js with JavaScript
- UI Framework: Material-UI and Tailwind CSS
- State Management: React Context API
- Backend: Firebase
- Deployment: Vercel
- Additional Libraries:
  - react-dnd for drag and drop
  - @react-pdf/renderer for PDF export
  - Material-UI for components
  - Tailwind CSS for styling

## Core Features

### Phase 1 (MVP)

1. **Weekly Meal Planning**

   - Interactive calendar view for a week
   - Ability to plan meals for breakfast, lunch, and dinner
   - Drag and drop interface for meal arrangement
   - Firebase data storage
   - Manual save functionality

2. **Meal Management**

   - Pre-defined list of meals (stored in Firebase)
   - Basic meal information (name, type - breakfast/lunch/dinner)
   - Search and filter meals

3. **Export Functionality**
   - Export weekly meal plan to PDF
   - Basic formatting and layout

### Phase 2

1. **User Authentication**

   - Firebase Google authentication integration
   - One-click Gmail sign-in flow
   - Automatic user profile creation
   - Personal meal plan storage
   - Session management
   - Protected routes implementation

2. **Recipe Integration**

   - Detailed recipe information for each meal
   - Ingredients list
   - Step-by-step cooking instructions
   - Cooking time and difficulty level

3. **Database Integration**
   - Migration from JSON to Firebase
   - Real-time data synchronization
   - User data persistence
   - Manual save functionality to reduce database operations
   - Environment variables for secure configuration

## Technical Requirements

### Frontend

- React components for calendar view
- State management (Context API or Redux)
- PDF generation library (e.g., react-pdf)
- Responsive design for mobile and desktop
- Modern UI framework (e.g., Material-UI or Tailwind CSS)

### Backend (Firebase)

- Authentication service
- Firestore database for storing:
  - User profiles
  - Meal data
  - Recipe information
  - Weekly plans

### Deployment

- Vercel hosting
- Continuous deployment from GitHub
- Environment configuration

## User Interface

### Main Views

1. **Weekly Calendar View**

   - 7-day or 30-day grid layout
   - Three slots per day (breakfast, lunch, dinner)
   - Each slots can contain up to 3 slot also
   - Drag and drop interface

2. **Meal Selection Panel**

   - List/grid of available meals
   - Search and filter options
   - Quick meal preview

3. **Recipe View** (Phase 2)
   - Detailed recipe information
   - Ingredients list
   - Cooking instructions
   - Images

## Future Enhancements

1. **Social Features**

   - Share meal plans
   - Community recipes
   - Rating system

2. **Nutritional Information**

   - Calorie counting
   - Macro tracking
   - Dietary restrictions

3. **Shopping List**

   - Generate shopping lists from meal plans
   - Ingredient quantity calculation

4. **Mobile App**
   - Expo-based mobile application
   - Cross-platform support
   - Offline functionality

## TO-DO Section

- Add personal meals
- Different meals for each day in Random number
- Recipe system implementation
- Shopping list generation
- Social sharing features

## DONE

- Auto Random Meal Planner(randomly distrubte meals)
- Basic UI implementation
- Weekly planning functionality
- PDF export feature
- Meal search and filtering
- Multiple meals per slot implementation
- Drag and drop functionality
- Mobile responsiveness improvements
- Remove meal functionality
- Firebase integration
- User authentication
- Data migration from JSON
- Manual save functionality
- Environment variables for secure configuration
