let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyDIsp3YwvJcCP_cjL4szhc2IE120EU4xoY";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let parts = [{ text: user.message }];
    if (user.file.data) {
        parts.push({ inline_data: user.file });
    }

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: parts
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data?.candidates?.[0]?.contents?.parts?.[0]?.text || "No response.";
        apiResponse = apiResponse.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } catch (error) {
        console.log("Error fetching from API:", error);
        text.innerHTML = "Failed to get a response.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    let html = `
        <img src="https://i.pinimg.com/736x/8b/16/7a/8b167af653c2399dd93b952a48740620.jpg" id="userImage" width="50">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="choosing"/>` : ""}
        </div>
    `;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <img src="https://pngimg.com/d/ai_PNG3.png" id="ChatImage" width="50">
            <div class="ai-chat-area">
                <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjdqa3NjbnY0b2g5dHpmZG1kZTNrYW4wYmx4ZmFhaW9ydGp5NjVxZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif" alt="loading" class="load" width="50">
            </div>
        `;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Handle Enter Key
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (prompt.value.trim() !== "") {
            handlechatResponse(prompt.value.trim());
        }
    }
});

// Handle Submit Button Click
submitbtn.addEventListener("click", () => {
    if (prompt.value.trim() !== "") {
        handlechatResponse(prompt.value.trim());
    }
});

// Handling Image Input
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        imagebtn.src = `data:${user.file.mime_type};base64,${user.file.data}`;
    };

    reader.readAsDataURL(file);
});

// Trigger Image Input on Clicking
imagebtn.addEventListener("click", () => {
    imageinput.click();
});
