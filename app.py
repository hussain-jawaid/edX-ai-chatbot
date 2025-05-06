from flask import Flask, request, jsonify, render_template
from groq import Groq
from config import api_key
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

client = Groq(api_key=api_key)


# Route to serve the HTML page
@app.route("/")
def home():
    return render_template("index.html")


# API route for chatbot messages
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")
    conversation_history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Prepare conversation for the API
    conversation = [
        {"role": "system", "content": "You are EdX, a helpful AI assistant."}
    ]

    # Add conversation history if available
    if conversation_history:
        conversation.extend(conversation_history)

    # Add the current user message
    conversation.append({"role": "user", "content": user_message})

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=conversation,
            temperature=0.7,
            max_completion_tokens=512,
            top_p=1
        )

        ai_response = completion.choices[0].message.content
        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)