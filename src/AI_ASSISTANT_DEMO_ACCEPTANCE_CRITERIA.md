# AI Assistant Demo - Acceptance Criteria

## Feature: Biometric Authentication

### Scenario: User accesses app with Face ID
**Given** the patient app is launched  
**When** the biometric authentication screen is displayed  
**Then** the user should see a Face ID icon  
**And** the user should see "Unlock with Face ID" message  
**And** the user should see a "Use Passcode" alternative option  

### Scenario: Successful biometric authentication
**Given** the user is on the biometric authentication screen  
**When** the user successfully authenticates with Face ID  
**Then** the app should navigate to the home screen  
**And** the bottom navigation should display 4 tabs: Home, Messages, Records, More  

---

## Feature: AI Assistant Chat Interface

### Scenario: Initial chat state
**Given** the user is authenticated  
**When** the user navigates to the Messages tab  
**Then** the chat interface should be displayed  
**And** the AI Assistant avatar should be visible  
**And** the message input field should be ready for input  
**And** no messages should be displayed initially  

### Scenario: Sending a message
**Given** the user is on the Messages screen  
**When** the user types a message and sends it  
**Then** the message should appear in the chat with right alignment  
**And** the message should have a blue background  
**And** a "Delivered" status should be shown  
**And** the AI Assistant typing indicator should appear  

---

## Feature: Appointment Inquiry

### Scenario: User asks about appointment availability
**Given** the user is in the AI Assistant chat  
**When** the user sends "I need to schedule an appointment"  
**Then** the AI should respond with available appointment types  
**And** the response should include buttons for "New Patient Visit", "Follow-up Visit", "Urgent Care"  
**And** the response should mention the practice cannot schedule directly through chat  

### Scenario: User selects appointment type
**Given** the AI has displayed appointment type options  
**When** the user clicks on "New Patient Visit"  
**Then** the button should show as selected  
**And** the AI should respond with next steps  
**And** the AI should offer to notify staff for scheduling assistance  

### Scenario: User requests staff assistance for appointment
**Given** the user has selected an appointment type  
**When** the user requests to speak with scheduling staff  
**Then** the AI should confirm the request  
**And** the AI should display "Request sent to scheduling team"  
**And** staff should receive notifications via email, SMS, and push  

---

## Feature: Prescription Refill Request

### Scenario: User requests prescription refill
**Given** the user is in the AI Assistant chat  
**When** the user sends "I need a prescription refill"  
**Then** the AI should acknowledge the request  
**And** the AI should ask which medication needs refilling  

### Scenario: User provides medication details
**Given** the AI has asked for medication details  
**When** the user provides the medication name  
**Then** the AI should confirm the medication  
**And** the AI should ask for pharmacy information  
**And** the AI should provide options for preferred pharmacy or entering a new one  

### Scenario: Completing refill request
**Given** the user has provided medication and pharmacy details  
**When** the user confirms the refill request  
**Then** the AI should display a confirmation message  
**And** the AI should provide a reference number  
**And** the AI should inform the user of expected processing time  

---

## Feature: Medical Question (Out of Scope)

### Scenario: User asks medical advice
**Given** the user is in the AI Assistant chat  
**When** the user sends a medical question like "What should I do about my headache?"  
**Then** the AI should politely decline to provide medical advice  
**And** the AI should recommend contacting their care team  
**And** the AI should offer to connect them with a nurse or provider  

### Scenario: Emergency situation detection
**Given** the user is in the AI Assistant chat  
**When** the user mentions emergency symptoms  
**Then** the AI should display an urgent alert  
**And** the AI should recommend calling 911  
**And** the AI should display emergency contact information prominently  

---

## Feature: General Practice Information

### Scenario: User asks about office hours
**Given** the user is in the AI Assistant chat  
**When** the user sends "What are your office hours?"  
**Then** the AI should display current office hours  
**And** the hours should be formatted clearly by day  
**And** any holiday closures should be mentioned  

### Scenario: User asks about location
**Given** the user is in the AI Assistant chat  
**When** the user sends "Where is your office located?"  
**Then** the AI should provide the practice address  
**And** the AI should offer directions or a map link  
**And** parking information should be included  

### Scenario: User asks about insurance
**Given** the user is in the AI Assistant chat  
**When** the user sends "Do you accept my insurance?"  
**Then** the AI should ask which insurance provider  
**And** after receiving the provider name, should confirm acceptance status  
**And** should provide billing contact information for further questions  

---

## Feature: Staff Response Notifications

### Scenario: Email notification delivery
**Given** a patient has requested staff assistance  
**When** the AI routes the request to staff  
**Then** an email notification should be generated  
**And** the email should include patient name, request type, and timestamp  
**And** the email should contain a secure link to open the patient app  
**And** the email subject should be "Patient Message Requires Response"  

### Scenario: SMS notification delivery
**Given** a patient has requested staff assistance  
**When** the AI routes the request to staff  
**Then** an SMS notification should be sent  
**And** the SMS should include the patient's first name and request type  
**And** the SMS should contain an "Open App" link  
**And** the SMS should be HIPAA-compliant with minimal PHI  

### Scenario: Push notification delivery
**Given** a patient has requested staff assistance  
**When** the AI routes the request to staff  
**Then** a push notification should be sent to the staff member's device  
**And** the notification should display on the lock screen  
**And** the notification should show patient name and request type  
**And** tapping the notification should open the secure messaging interface  

### Scenario: Staff notification interaction
**Given** a staff member receives any notification (email, SMS, or push)  
**When** the staff member clicks the notification link  
**Then** the patient app should open to the biometric authentication screen  
**And** after authentication, the app should navigate to the Messages tab  
**And** the patient's message should be visible in the chat  

---

## Feature: Pre-Chat Disclaimer

### Scenario: First-time user sees disclaimer
**Given** a new user launches the patient app for the first time  
**When** the app loads after initial authentication  
**Then** a disclaimer screen should be displayed  
**And** the disclaimer should explain AI limitations  
**And** the disclaimer should state appointments cannot be scheduled via chat  
**And** the user must accept before proceeding  

### Scenario: User accepts disclaimer
**Given** the disclaimer screen is displayed  
**When** the user clicks "I Understand" or "Accept"  
**Then** the disclaimer should close  
**And** the user should be navigated to the home screen  
**And** the disclaimer should not be shown again for this user  

---

## Feature: Message Status and Delivery

### Scenario: Message delivery status
**Given** the user has sent a message  
**When** the message is successfully delivered  
**Then** a "Delivered" status should appear below the message  
**And** the status should include a checkmark icon  
**And** the timestamp should be displayed  

### Scenario: AI typing indicator
**Given** the user has sent a message  
**When** the AI is processing a response  
**Then** a typing indicator should be displayed  
**And** the indicator should show animated dots  
**And** the indicator should appear for a realistic duration (1-3 seconds)  

### Scenario: AI response delivery
**Given** the AI has finished processing  
**When** the response is ready  
**Then** the typing indicator should disappear  
**And** the AI message should appear with left alignment  
**And** the AI message should have a light gray background  
**And** the AI Assistant avatar should be displayed next to the message  

---

## Feature: Quick Actions and Buttons

### Scenario: Interactive button display
**Given** the AI provides options to the user  
**When** the response includes selectable options  
**Then** buttons should be displayed below the message  
**And** buttons should be clearly tappable with adequate spacing  
**And** buttons should display relevant icons and labels  

### Scenario: Button selection
**Given** interactive buttons are displayed  
**When** the user taps a button  
**Then** the button should show a selected state  
**And** the selection should be sent as a message from the user  
**And** the AI should respond based on the selected option  

### Scenario: Multiple button groups
**Given** the conversation includes multiple choice points  
**When** new buttons are displayed  
**Then** previous buttons should remain visible but disabled  
**And** only the most recent button group should be interactive  
**And** the conversation history should show all selections  

---

## Feature: Navigation and UI Consistency

### Scenario: Bottom navigation visibility
**Given** the user is on any main screen  
**When** the screen is displayed  
**Then** the bottom navigation should always be visible  
**And** the navigation should have exactly 4 items  
**And** the active tab should be highlighted  

### Scenario: Tab switching
**Given** the user is on the Messages tab  
**When** the user taps the Home tab  
**Then** the app should navigate to the Home screen  
**And** the Messages conversation should be preserved  
**And** returning to Messages should show the same conversation state  

### Scenario: Date format consistency
**Given** any date is displayed in the app  
**When** the date is rendered  
**Then** it should use the format "Jun 10"  
**And** month should be abbreviated to 3 letters  
**And** year should only be shown if different from current year  

---

## Feature: Error Handling

### Scenario: Network error during message send
**Given** the user is in the AI Assistant chat  
**When** the user sends a message and network fails  
**Then** an error message should be displayed  
**And** the user should be offered the option to retry  
**And** the message should be saved locally  

### Scenario: AI service unavailable
**Given** the AI service is temporarily down  
**When** the user attempts to send a message  
**Then** a graceful error message should be displayed  
**And** the message should offer to connect with staff directly  
**And** the system should log the failure for monitoring  

---

## Feature: Accessibility

### Scenario: Screen reader support
**Given** a user with screen reader enabled  
**When** navigating the AI Assistant chat  
**Then** all messages should be readable by screen reader  
**And** all buttons should have descriptive labels  
**And** the chat flow should be navigable with voice commands  

### Scenario: Text size adjustments
**Given** a user has system-level text size preferences  
**When** viewing the chat interface  
**Then** text should scale according to system settings  
**And** the layout should remain functional at larger sizes  
**And** message bubbles should expand to accommodate text  

---

## Feature: Demo Documentation

### Scenario: AI Assistant Replies tab content
**Given** an admin views the AI Assistant Replies section  
**When** the page loads  
**Then** 4 tabs should be displayed: Appointment Inquiries, Prescription Refills, General Questions, Staff Response Channels  
**And** each tab should contain relevant example scenarios  
**And** staff notification previews should be interactive  

### Scenario: Staff response channel preview
**Given** an admin is on the Staff Response Channels tab  
**When** the admin clicks any notification preview (Email, SMS, or Push)  
**Then** a modal should open showing the patient app  
**And** the modal should start at the biometric authentication screen  
**And** after auth, the admin should be able to navigate to the Messages tab  
**And** the modal should have a close button to return to the admin view  

---

## Non-Functional Requirements

### Performance
**Given** any user interaction  
**When** an action is performed  
**Then** the response should occur within 2 seconds  
**And** the UI should remain responsive during AI processing  

### Security
**Given** any patient data is transmitted  
**When** communication occurs between client and server  
**Then** all data must be encrypted in transit  
**And** all stored data must be encrypted at rest  
**And** sessions must expire after 15 minutes of inactivity  

### Compliance
**Given** the AI Assistant handles patient communications  
**When** any message is sent or received  
**Then** all interactions must be HIPAA compliant  
**And** all messages must be logged for audit purposes  
**And** patient consent must be verified before first use
