import ast
import google.generativeai as genai
from rapidfuzz import fuzz, process
import database

genai.configure(api_key="AIzaSyAQoD82B3hPvnJSz3obqW8CSIB6VLVdKlk")



def process_prescription():
    print("⇨ Your prescription is handwritten and we require more details to process it.")
    disease=input("⇨ Please enter the disease you are suffering from: ")


    try:
        prompt = (
            "You are a specialized medical assistant AI designed to process prescription documents.\n"
            "you have to analyse the photo and find whether it is handwritten or printed.\n"
            "return the answer as 'handwritten' or 'printed'\n"
            "only this, no other talks or hallucinations"
        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        with open('pres.jpg', 'rb') as img_file:
            image_bytes = img_file.read()
        image_dict = {"mime_type": "image/jpeg", "data": image_bytes}
        response = model.generate_content([prompt, image_dict])
        determination = response.text
        print("⇨", determination)
    except Exception as e:
        print("AI error:", e)





def extract_from_handwritten(command):
    try:
        prompt = (
            "You are a specialized medical assistant AI designed to process handwritten prescription documents.\n"
            "Identify the medicine names from the handwriting.\n"
            "Respond only with a Python list of medicine names, for example:\n"
            '["Metformin", "Aspirin", "Paracetamol"]\n'
            "doctor messy writting is a problem i know but dont try to guess anything give that you analysed i can clean that myself\n" 
            "\nGeneral Instructions:\nDo not add greetings, apologies, or extra commentary.\nMaintain accuracy and clarity.\nProcess the prescription now."
            f"User: and the image attached and the image attached to it{command}"
        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        with open('pres.jpg', 'rb') as img_file:
            image_bytes = img_file.read()
        image_dict = {"mime_type": "image/jpeg", "data": image_bytes}
        response = model.generate_content([prompt, image_dict])
        medicines_str = response.text.strip()
        try:
            medicines = ast.literal_eval(medicines_str)
        except Exception:
            medicines = []
        return medicines
    except Exception as e:
        print("AI error:", e)
        return []



def extract_from_printed(command):
    try:
        prompt = (
            "You are a specialized medical assistant AI designed to process prescription documents.\n"
            "\nYour tasks are as follows:\n"
            "\nHandwritten Prescription:\n"
            "\nIdentify that the prescription is handwritten based on irregular strokes and handwriting traits.\n"
            "\nExtract only the medicine names that are clearly readable from the handwriting.\n"
            "\nRespond only with a Python list of medicine names, for example:\n"
            '["Metformin", "Aspirin", "Paracetamol"]\n'
            "\nDo not include any other information or explanation.\n"
            "\nDo not guess, assume, or hallucinate any medicine names that are unclear.\n"
            "\nIf no medicines are identifiable, respond with an empty Python list: []\n"
            "\n\nPrinted Prescription:\n"
            "\nIdentify that the prescription is printed, with neat and uniform text.\n"
            "\nExtract all medicine details clearly present in the prescription. For each medicine provide:\n"
            "\nMedicine name (generic or brand)\n"
            "\nDosage (exact amount and units, e.g., 500 milligrams)\n"
            "\nForm (tablet, syrup, injection, capsule, etc.)\n"
            "\nFrequency (how often to take, e.g., twice daily)\n"
            "\nDuration (for how many days)\n"
            "\nAny special instructions or notes (e.g., after food)\n"
            "\n\nPresent the information in a clear, easy-to-read format, grouping each medicine’s details, for example:\n"
            "\n\nMedicine Name: Metformin\nDosage: 500 milligrams\nForm: Tablet\nFrequency: Twice daily\nDuration: Thirty days\nNotes: Take after food\n"
            "\nMedicine Name: Aspirin\nDosage: 75 milligrams\nForm: Tablet\nFrequency: Once daily\nDuration: Fifteen days\nNotes: None\n"
            "\nOnly extract information that is clearly present in the prescription.\n"
            "\nDo not guess, assume, or hallucinate any details.\n"
            "\nIf no medicines are identifiable, reply: No medicines detected in the printed prescription.\n"
            "\n\nGeneral Instructions:\nDo not add greetings, apologies, or extra commentary.\nMaintain accuracy and clarity.\nProcess the prescription now."
            f"User: and the image attached {command}"
        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        with open('pres.jpg', 'rb') as img_file:
            image_bytes = img_file.read()
        image_dict = {"mime_type": "image/jpeg", "data": image_bytes}
        response = model.generate_content([prompt, image_dict])
        medicines = response.text
        print("AI:", medicines)
    except Exception as e:
        print("AI error:", e)


def validate_medicines(medicines_list):
    try:
        prompt = (
            "You are a medical safety validation assistant.\n"
            "\nYour job is to:\n"
            "1. Review the list of medicines provided.\n"
            "2. Check for:\n"
            "   a. Duplicate medicines (same drug, different brand names).\n"
            "   b. Drug and drug interactions (known harmful or cautionary combinations).\n"
            "   c. Dosage conflicts (unusually high, low, or unsafe combinations).\n"
            "   d. Contraindications (medicine unsafe with certain health conditions).\n"
            "3. Use only well-known, reliable medical knowledge.\n"
            "4. If there is no reliable data, say exactly: No reliable data available.\n"
            "5. Do not guess or invent any information.\n"
            "\nOutput format: natural language.\n"
            "Clearly list any duplicates you found.\n"
            "Clearly list any interactions and explain them briefly.\n"
            "Clearly mention any dosage issues and why they might be a problem.\n"
            "Clearly list any contraindications with reasons.\n"
            "If none are found in any category, say: No issues found for that category.\n"
            f"\nMedicines list:\n{medicines_list}\n"
        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content([prompt])
        
        validation_results = response.text
        print("AI:", validation_results)


        
    except Exception as e:
        print("AI error:", e)



def conversation(user_message=""):

    try:
        prompt = (
            "You are DoseIQ, a friendly and knowledgeable health assistant.\n"
            "\nYour job is to:\n"
            "1. Greet the user warmly and naturally.\n"
            "2. Answer their questions about medicines, including usage instructions, possible side effects, precautions, and common alternatives.\n"
            "3. Explain medical terms in simple, everyday language that anyone can understand.\n"
            "4. If the question is not about medicines, you can answer general health and wellness questions, but do not give any diagnosis or prescription.\n"
            "5. If you are unsure about something, clearly say you are unsure and suggest consulting a doctor.\n"
            "6. Avoid guessing or making up information. Always rely on widely accepted and reliable medical knowledge.\n"
            "7. Be empathetic and respectful in tone.\n"
            "\nOutput format: Friendly, conversational style without medical jargon unless necessary. When medical terms are used, explain them simply.\n"
            "\nExample Output for a medicine question:\n"
            "Hi there! Paracetamol is used to relieve mild to moderate pain and reduce fever. It is generally safe when taken in the correct dose, but taking too much can harm the liver. For adults, the usual maximum daily dose is 4000 mg.\n"
            "\nExample Output for a casual greeting:\n"
            "Hello! Hope you are having a good day. How can I help you with your medicines today?\n"
            f"\nUser: {user_message}"
        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content([prompt])
        conversation = response.text
        print("AI:", conversation)
        return conversation  # Return the response
    except Exception as e:
        print("AI error:", e)
        return None  # Return None on error
    

def health_education(command):
    try:
        prompt = (
            "You are a health education assistant AI.\n"
            "\nYour job is to:\n"
            "1. Provide clear, accurate information about health topics.\n"
            "2. Explain medical terms in simple language that anyone can understand.\n"
            "3. Offer general health tips and advice based on widely accepted medical knowledge.\n"
            "4. If you are unsure about something, clearly say you are unsure and suggest consulting a doctor.\n"
            "5. Avoid guessing or making up information.\n"
            "\nOutput format: Friendly, educational style without medical jargon unless necessary. When medical terms are used, explain them simply."
            "give normal range answers not very short and not very long\n"
            "be friendly and answer like a human"
            f"User: {command}"

        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content([prompt])
        education_content = response.text
        print("⇨", education_content)
    except Exception as e:
        print("AI error:", e)


def prepare_and_match(disease):
    try:
        # Get extracted medicine list from handwritten OCR
        extracted_list = extract_from_handwritten()
        if not extracted_list:
            print("No medicines extracted from the prescription.")
            return
        matches = database.fuzzy_match_list_for_disease(disease, extracted_list)
        for original, info in matches.items():
            if info["match"]:
                print(f"{original} → {info['match']} (Score: {info['score']})")
            else:
                print(f"{original} → No close match found.")

    except Exception as e:
        print("Error occurred while preparing and matching:", e)


def detect_intent(user_message):
        try:

            prompt = f"""
            You are an intent classification system for a medical assistant.
            Classify the user message into one of these intents:
            
            choose any one of these strictly ,and as it is they are , no add of extra space or anything
            only one of thses as per intent
            "process_prescription"            
            "validate_medicine"
            "process_general_chat"
            "process_health_education"
            "exit"


            Only return the intent name, nothing else.
            Message: "{user_message}"
            """
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content([prompt])
            detection = response.text.strip()  # STRIP WHITESPACE
            print(detection)

            return detection

        except Exception as e:
            print("AI error:", e)


def other_info(command):
    try:
        prompt = (
            "You are a health information assistant AI.\n"
            "\nYour job is to:\n"
            "1. Provide general information about health topics.\n"
            "2. Answer questions related to symptoms, treatments, and medications.\n"
            "3. Offer advice on when to seek medical attention.\n"
            "4. If you are unsure about something, clearly say you are unsure and suggest consulting a doctor.\n"
            "5. Avoid guessing or making up information.\n"
            "\nOutput format: Friendly, informative style without medical jargon unless necessary. When medical terms are used, explain them simply."
            "give normal range answers not very short and not very long\n"
            "be friendly and answer like a human"
            f"User: {command}"

        )
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content([prompt])
        info_content = response.text
        print("⇨", info_content)
    except Exception as e:
        print("AI error:", e)


def summarize_with_gemini(conversation_history):
    try:
        # Convert conversation history to text
        conversation_text = "\n".join([f"{msg['role']}: {msg['text']}" for msg in conversation_history])
        
        prompt_text = (
            "You are a medical conversation summarizer. "
            "Analyze the following conversation between a user and a health assistant. "
            "Extract and summarize only the important health-related information such as:\n"
            "- Medicines mentioned or prescribed\n"
            "- Health conditions discussed\n"
            "- Medical advice given\n"
            "- Symptoms reported\n"
            "- Prescription details\n"
            "Ignore greetings, general chat, and non-medical content.\n"
            "Provide a concise medical summary in 2-3 sentences.\n\n"
            f"Conversation:\n{conversation_text}"
        )
        
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content([prompt_text])
        summary = response.text.strip()
        print("⇨ Health summary generated and saved to your profile.")
        return summary
    except Exception as e:
        print("AI error:", e)
        return "Summary generation failed."

