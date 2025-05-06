const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatMessages = document.getElementById("chat-messages");
const heading = document.getElementById("heading");

// Add a reset button to the interface when the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Create reset button
    const resetButton = document.createElement("button");
    resetButton.id = "reset-chat";
    resetButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    resetButton.title = "Clear conversation";
    resetButton.addEventListener("click", resetChat);

    // Add reset button to the chat container
    const chatContainer = document.getElementById("chat-container");
    chatContainer.appendChild(resetButton);

    // Load chat history
    loadChatHistory();

    // Force reflow to ensure all styles are applied correctly
    document.body.offsetHeight;
});

// Function to reset the chat
function resetChat() {
    // Clear localStorage
    localStorage.removeItem("chatHistory");

    // Clear chat messages
    chatMessages.innerHTML = "";

    // Show heading again
    heading.classList.remove("hidden");
}

// Function to load chat history
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];

    if (history.length > 0) {
        // Hide heading if there's chat history
        heading.classList.add("hidden");

        // Display previous messages
        history.forEach(message => {
            if (message.role === "user") {
                addUserMessage(message.content);
            } else {
                addBotMessage(message.content);
            }
        });

        // Scroll to bottom of chat with a slight delay to ensure rendering is complete
        setTimeout(scrollToBottom, 100);
    }
}

// Function to save chat history
function saveChatHistory(role, content) {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.push({ role, content });
    localStorage.setItem("chatHistory", JSON.stringify(history));
}

// Function to add user message to chat
function addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    // Force reflow to ensure styles are applied
    messageDiv.offsetHeight;
}

// Function to add bot message to chat
function addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot-message";
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    // Force reflow to ensure styles are applied
    messageDiv.offsetHeight;
}

// Function to scroll to bottom of chat
function scrollToBottom() {
    // Force layout recalculation before scrolling
    chatMessages.offsetHeight;
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Hide heading on first message
    if (!heading.classList.contains("hidden")) {
        heading.classList.add("hidden");
    }

    // Display user message
    addUserMessage(userMessage);
    saveChatHistory("user", userMessage);

    // Clear input
    input.value = "";

    // Scroll to bottom
    scrollToBottom();

    // Send message to backend
    try {
        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();
        if (data.response) {
            addBotMessage(data.response);
            saveChatHistory("assistant", data.response);
        } else {
            addBotMessage("Error getting response.");
            saveChatHistory("assistant", "Error getting response.");
        }

        scrollToBottom();
    } catch (err) {
        addBotMessage("Network error. Please try again.");
        saveChatHistory("assistant", "Network error. Please try again.");
        scrollToBottom();
    }
});
