const API_URL =
    "https://smart-email-assistant-api-is75.onrender.com/api/email/generate";

console.log("[SAI] Background service worker loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action !== "generateEmailReply") {
        return;
    }

    generateEmailReply(request.data)
        .then(reply => {
            sendResponse({
                success: true,
                reply: reply
            });
        })
        .catch(error => {
            console.error("[SAI] Backend error:", error);

            sendResponse({
                success: false,
                error: error.message
            });
        });

    return true;
});


async function generateEmailReply(data) {

    console.log("[SAI] Sending request to:", API_URL);
    console.log("[SAI] Payload:", data);

    const response = await fetch(API_URL, {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            sender: data.sender,
            subject: data.subject,
            emailContent: data.emailContent,
            responseApproach: data.responseApproach || "NEUTRAL",
            tone: data.tone || "professional"
        })
    });

    if (!response.ok) {

        const errorText = await response.text();

        throw new Error(
            `Backend returned ${response.status}: ${errorText}`
        );
    }

    const reply = await response.text();

    if (!reply || !reply.trim()) {
        throw new Error("Backend returned an empty reply");
    }

    console.log("[SAI] Reply received");

    return reply;
}