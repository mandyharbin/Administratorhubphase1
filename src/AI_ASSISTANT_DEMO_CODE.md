# AI Assistant Demo Code

The AI Assistant demo is implemented in the `PatientAppDemo` component located at `/components/PatientAppDemo.tsx`.

## Usage in App.tsx

```tsx
// In App.tsx, the AI Assistant demo is rendered when activeSection === 'ai-assistant'
{activeSection === 'ai-assistant' ? (
  <PatientAppDemo initialScreen="disclaimer" />
) : (
  // ... other sections
)}
```

## Key Props

- `initialScreen`: Can be set to any `DemoScreen` type to start the demo at a specific screen
  - For AI Assistant demo, it's set to `"disclaimer"`

## Component Location

- **File**: `/components/PatientAppDemo.tsx`
- **Component**: `PatientAppDemo`
- **Type**: React functional component with hooks

## Features Included

The PatientAppDemo component includes:
- Full patient mobile app simulation
- Chat interface with AI Assistant
- Message routing to staff
- Notification system
- Multi-account support
- Profile management
- QR code scanning flow
- Registration flows
- MFA setup
- And more...

## To View Just AI Chat

When initialized with `initialScreen="disclaimer"`, the demo shows:
1. AI chat disclaimer screen first
2. Then navigates to the main chat interface
3. Includes pre-loaded conversation with AI Assistant
4. Shows message routing when AI can't handle requests
5. Demonstrates staff responses

## Code Structure

```tsx
export function PatientAppDemo({ initialScreen = 'app-download' }: PatientAppDemoProps) {
  // State management
  const [currentScreen, setCurrentScreen] = useState<DemoScreen>(initialScreen);
  const [chatMessages, setChatMessages] = useState<Message[]>([...]);
  
  // Chat functionality
  const handleSendMessage = () => {
    // Sends message, triggers AI response or routing
  };
  
  // Screen rendering based on currentScreen state
  return (
    <MobileFrame viewMode={viewMode}>
      {currentScreen === 'disclaimer' && <DisclaimerScreen />}
      {currentScreen === 'chat' && <ChatScreen />}
      {/* ... other screens */}
    </MobileFrame>
  );
}
```

## File Size

The PatientAppDemo.tsx file is approximately **6000+ lines** and contains the complete patient-facing application demo including all flows and screens.

If you need specific sections extracted or want to see particular functionality, please let me know which part you'd like to focus on.
