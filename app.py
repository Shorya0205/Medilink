from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import prompt
import google.generativeai as genai
import database

# Configure Gemini AI (same as your main.py)
genai.configure(api_key="AIzaSyAQoD82B3hPvnJSz3obqW8CSIB6VLVdKlk")

app = FastAPI()

# Enable CORS for your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str
    user_name: str

# Store conversation history (simple in-memory storage)
conversation_history = []

@app.get("/")
async def serve_chat():
    return FileResponse("templates/index.html")

@app.get("/intro")
async def serve_intro():
    return FileResponse("intro page/intro.html")

@app.get("/style.css")
async def serve_css():
    return FileResponse("static/css/style.css")

@app.get("/script.js")
async def serve_js():
    return FileResponse("static/js/script.js")

@app.get("/script_intro.css")
async def serve_intro_css():
    return FileResponse("intro page/script_intro.css")

@app.get("/script_intro.js")
async def serve_intro_js():
    return FileResponse("intro page/script_intro.js")

@app.get("/static/css/style.css")
async def serve_static_css():
    return FileResponse("static/css/style.css")

@app.get("/static/js/script.js")
async def serve_static_js():
    return FileResponse("static/js/script.js")

@app.post("/api/chat")
async def process_message(chat_message: ChatMessage):
    try:
        message = chat_message.message
        user_name = chat_message.user_name
        
        print(f"Received message: {message}")  # Debug logging
        
        # This is your main.py while loop logic converted to API
        detect_intent = prompt.detect_intent(message)
        print(f"Detected intent: {detect_intent}")  # Debug logging
        
        conversation_history.append({"role": "user", "text": message, "intent": detect_intent})
        
        ai_response = ""  # Initialize response
        
        if detect_intent == "exit":
            summary = prompt.summarize_with_gemini(conversation_history)
            database.update_past_prescriptions(user_name, summary)
            ai_response = "Thank you for using DoseIQ. Goodbye!"
            
        elif detect_intent == "process_prescription":
            if prompt.process_prescription() == "handwritten":
                ai_response = prompt.extract_from_handwritten(message)
            else:
                ai_response = prompt.extract_from_printed(message)
            
        elif detect_intent == "validate_medicine":
            ai_response = prompt.validate_medicines()
            
        elif detect_intent == "process_general_chat":
            print(f"Calling conversation() with message: {message}")  # Debug
            try:
                ai_response = prompt.conversation(message)
                print(f"conversation() returned: {ai_response}")  # Debug
                print(f"Type of response: {type(ai_response)}")  # Debug
            except Exception as e:
                print(f"Error calling conversation(): {e}")  # Debug
                ai_response = None
            
        elif detect_intent == "process_health_education":
            ai_response = prompt.health_education(message)
            
        elif detect_intent == "prepare_and_match":
            ai_response = prompt.prepare_and_match(message)
            
        else:
            ai_response = prompt.other_info(message)
        
        # Ensure ai_response is not None and convert to string
        if ai_response is None:
            ai_response = "I'm sorry, I couldn't process your request at the moment. Please try again."
        
        ai_response_str = str(ai_response)
        print(f"AI Response: {ai_response_str}")  # Debug logging
        
        # Add to conversation history
        conversation_history.append({"role": "ai", "text": ai_response_str, "intent": detect_intent})
        
        return {"response": ai_response_str, "intent": detect_intent}
        
    except Exception as e:
        print(f"Error in process_message: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
