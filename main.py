import prompt
import google.generativeai as genai
import database
import sqlite3

def collect_user_info():
    print("Let's get to know you for better health management!")
    user_name = input("What is your name? ")
    gender = input("What is your gender? ")
    blood_group = input("What is your blood group? ")
    mobile_number = input("What is your mobile number? ")
    long_term_disease = input("Do you have any long-term diseases? (comma separated, or 'none') ")
    
    database.add_user(
        user_name,
        gender,
        blood_group,
        mobile_number,
        long_term_disease,
        ""  # Empty string for past_prescriptions - will be filled later from conversation
    )
    print("Your information has been saved!")
    return user_name

def check_existing_user():
    """Check if user exists by name and mobile number"""
    try:
        print("Please verify your identity:")
        check_name = input("Enter your name: ")
        check_mobile = input("Enter your mobile number: ")
        
        import sqlite3
        conn = sqlite3.connect('doseiq.db')
        cursor = conn.cursor()
        cursor.execute(
            "SELECT user_name FROM user WHERE user_name = ? AND mobile_number = ?", 
            (check_name, check_mobile)
        )
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return user[0]  # Return the username
        else:
            print("User not found. Please register.")
            return None
    except Exception as e:
        print(f"Database error: {e}")
        return None

genai.configure(api_key="AIzaSyAQoD82B3hPvnJSz3obqW8CSIB6VLVdKlk")


if __name__ == "__main__":
    # Check if user already exists
    existing_user = check_existing_user()
    
    if existing_user:
        print(f"Welcome back, {existing_user}! 🏥")
        user_name = existing_user
    else:
        print("First time setup required:")
        user_name = collect_user_info()
    conversation_history = []
    while True:
        try:
            message = input("⇨ ")
            detect_intent = prompt.detect_intent(message)
            conversation_history.append({"role": "user", "text": message, "intent": detect_intent})
            
            if detect_intent == "exit":
                summary = prompt.summarize_with_gemini(conversation_history)
                database.update_past_prescriptions(user_name, summary)
                print("Thank you for using DoseIQ . Goodbye!")
                break
            elif detect_intent == "process_prescription":
                if prompt.process_prescription() == "handwritten":
                    print("Processing_handwritten_prescription...")
                    ai_response = prompt.extract_from_handwritten(message)
                else:
                    print("Processing_digital_prescription...")
                    ai_response = prompt.extract_from_printed(message)
                conversation_history.append({"role": "ai", "text": str(ai_response), "intent": detect_intent})
            elif detect_intent == "validate_medicine":
                ai_response = prompt.validate_medicines()
                conversation_history.append({"role": "ai", "text": str(ai_response), "intent": detect_intent})
            elif detect_intent == "process_general_chat":
                ai_response = prompt.conversation()
                conversation_history.append({"role": "ai", "text": str(ai_response), "intent": detect_intent})
            elif detect_intent == "process_health_education":
                ai_response = prompt.health_education(message)
                conversation_history.append({"role": "ai", "text": str(ai_response), "intent": detect_intent})
            elif detect_intent == "prepare_and_match":
                ai_response = prompt.prepare_and_match(message)
                conversation_history.append({"role": "ai", "text": str(ai_response), "intent": detect_intent})
            else:
                print("Unknown intent detected.")
                ai_response = prompt.other_info(message)
                conversation_history.append({"role": "ai", "text": str(ai_response), "intent": detect_intent})
        except Exception as e:
            print("AI error:", e)


