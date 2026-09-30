(() => {

    const BUTTON_ID = "smart-ai-email-reply-button";
    const PANEL_ID = "smart-ai-email-panel";

    console.log("[SAI] Content script loaded");


    // =========================================================
    // CREATE CONTROLS
    // =========================================================

    function createControls() {

        if (document.getElementById(PANEL_ID)) {
            return;
        }

        const panel = document.createElement("div");

        panel.id = PANEL_ID;

        panel.style.position = "fixed";
        panel.style.right = "25px";
        panel.style.bottom = "25px";
        panel.style.zIndex = "999999";

        panel.style.background = "#ffffff";
        panel.style.border = "1px solid #ddd";
        panel.style.borderRadius = "8px";
        panel.style.padding = "12px";

        panel.style.boxShadow =
            "0 2px 10px rgba(0,0,0,0.15)";

        panel.style.fontFamily = "Arial, sans-serif";


        // -----------------------------------------------------
        // Response selection
        // -----------------------------------------------------

        const responseLabel =
            document.createElement("label");

        responseLabel.innerText = "Response: ";

        responseLabel.style.marginRight = "5px";


        const responseSelect =
            document.createElement("select");

        responseSelect.id =
            "smart-ai-response-select";

        responseSelect.style.marginRight = "10px";


        const responseOptions = [
            {
                value: "POSITIVE",
                text: "Positive"
            },
            {
                value: "NEUTRAL",
                text: "Neutral"
            },
            {
                value: "NEGATIVE",
                text: "Negative"
            }
        ];


        responseOptions.forEach(option => {

            const element =
                document.createElement("option");

            element.value = option.value;
            element.textContent = option.text;

            responseSelect.appendChild(element);
        });


        // Default

        responseSelect.value = "NEUTRAL";


        // -----------------------------------------------------
        // Tone selection
        // -----------------------------------------------------

        const toneLabel =
            document.createElement("label");

        toneLabel.innerText = "Tone: ";

        toneLabel.style.marginRight = "5px";


        const toneSelect =
            document.createElement("select");

        toneSelect.id =
            "smart-ai-tone-select";

        toneSelect.style.marginRight = "10px";


        const toneOptions = [
            {
                value: "professional",
                text: "Professional"
            },
            {
                value: "friendly",
                text: "Friendly"
            },
            {
                value: "formal",
                text: "Formal"
            },
            {
                value: "casual",
                text: "Casual"
            }
        ];


        toneOptions.forEach(option => {

            const element =
                document.createElement("option");

            element.value = option.value;
            element.textContent = option.text;

            toneSelect.appendChild(element);
        });


        // Default

        toneSelect.value = "professional";


        // -----------------------------------------------------
        // AI Reply button
        // -----------------------------------------------------

        const button =
            document.createElement("button");

        button.id = BUTTON_ID;

        button.innerText = "✨ AI Reply";


        button.style.padding = "8px 14px";

        button.style.border = "none";

        button.style.borderRadius = "5px";

        button.style.background = "#1a73e8";

        button.style.color = "white";

        button.style.fontWeight = "600";

        button.style.cursor = "pointer";


        button.addEventListener(
            "click",
            handleAIReply
        );


        // -----------------------------------------------------
        // Add everything
        // -----------------------------------------------------

        panel.appendChild(responseLabel);
        panel.appendChild(responseSelect);

        panel.appendChild(toneLabel);
        panel.appendChild(toneSelect);

        panel.appendChild(button);


        document.body.appendChild(panel);
    }


    // =========================================================
    // GENERATE AI REPLY
    // =========================================================

    async function handleAIReply() {

        const button =
            document.getElementById(BUTTON_ID);


        try {

            button.disabled = true;

            button.innerText =
                "Generating...";


            // -------------------------------------------------
            // Get selected response
            // -------------------------------------------------

            const responseApproach =
                document.getElementById(
                    "smart-ai-response-select"
                ).value;


            // -------------------------------------------------
            // Get selected tone
            // -------------------------------------------------

            const tone =
                document.getElementById(
                    "smart-ai-tone-select"
                ).value;


            console.log(
                "[SAI] Response:",
                responseApproach
            );

            console.log(
                "[SAI] Tone:",
                tone
            );


            // -------------------------------------------------
            // Extract Gmail email
            // -------------------------------------------------

            const emailData =
                extractEmail();


            if (!emailData.emailContent) {

                throw new Error(
                    "Could not find email content. Open an email first."
                );
            }


            console.log(
                "[SAI] Email:",
                emailData
            );


            // -------------------------------------------------
            // Send request to backend
            // -------------------------------------------------

            const result =
                await chrome.runtime.sendMessage({

                    action: "generateEmailReply",

                    data: {

                        sender:
                            emailData.sender,

                        subject:
                            emailData.subject,

                        emailContent:
                            emailData.emailContent,

                        responseApproach:
                            responseApproach,

                        tone:
                            tone
                    }
                });


            if (!result) {

                throw new Error(
                    "No response from background service."
                );
            }


            if (!result.success) {

                throw new Error(
                    result.error
                );
            }


            console.log(
                "[SAI] Generated reply:",
                result.reply
            );


            // -------------------------------------------------
            // Insert into Gmail
            // -------------------------------------------------

            insertReply(result.reply);


            button.innerText =
                "✓ Reply Generated";


            setTimeout(() => {

                button.innerText =
                    "✨ AI Reply";

                button.disabled = false;

            }, 2000);

        }

        catch (error) {

            console.error(
                "[SAI]",
                error
            );


            alert(
                "Smart AI Email Assistant Error:\n\n" +
                error.message
            );


            button.innerText =
                "✨ AI Reply";

            button.disabled = false;
        }
    }


    // =========================================================
    // EXTRACT EMAIL
    // =========================================================

    function extractEmail() {

        let sender = "";
        let subject = "";
        let emailContent = "";


        // -----------------------------------------------------
        // Subject
        // -----------------------------------------------------

        const subjectElement =
            document.querySelector("h2.hP");


        if (subjectElement) {

            subject =
                subjectElement.innerText.trim();
        }


        // -----------------------------------------------------
        // Sender
        // -----------------------------------------------------

        const senderElement =
            document.querySelector(".gD");


        if (senderElement) {

            sender =
                senderElement.getAttribute("email") ||
                senderElement.innerText ||
                "";
        }


        // -----------------------------------------------------
        // Email body
        // -----------------------------------------------------

        const bodyElements =
            document.querySelectorAll(
                ".a3s.aiL"
            );


        if (bodyElements.length > 0) {

            const lastBody =
                bodyElements[
                    bodyElements.length - 1
                ];


            emailContent =
                lastBody.innerText.trim();
        }


        // -----------------------------------------------------
        // Fallback
        // -----------------------------------------------------

        if (!emailContent) {

            const alternativeBodies =
                document.querySelectorAll(
                    ".ii.gt"
                );


            if (alternativeBodies.length > 0) {

                const lastBody =
                    alternativeBodies[
                        alternativeBodies.length - 1
                    ];


                emailContent =
                    lastBody.innerText.trim();
            }
        }


        return {

            sender,
            subject,
            emailContent
        };
    }


    // =========================================================
    // INSERT REPLY
    // =========================================================

    function insertReply(reply) {

        let replyBox =
            document.querySelector(
                'div[contenteditable="true"][aria-label*="Message Body"]'
            );


        if (!replyBox) {

            replyBox =
                document.querySelector(
                    'div[contenteditable="true"][role="textbox"]'
                );
        }


        // -----------------------------------------------------
        // Open Gmail reply box
        // -----------------------------------------------------

        if (!replyBox) {

            const replyButtons =
                document.querySelectorAll(
                    '[aria-label="Reply"]'
                );


            if (replyButtons.length > 0) {

                replyButtons[
                    replyButtons.length - 1
                ].click();
            }


            setTimeout(() => {

                insertReply(reply);

            }, 1000);


            return;
        }


        // -----------------------------------------------------
        // Clear box
        // -----------------------------------------------------

        replyBox.innerHTML = "";


        // -----------------------------------------------------
        // Insert text
        // -----------------------------------------------------

        const lines =
            reply.split("\n");


        lines.forEach(line => {

            const div =
                document.createElement("div");

            div.textContent = line;

            replyBox.appendChild(div);
        });


        // -----------------------------------------------------
        // Notify Gmail
        // -----------------------------------------------------

        replyBox.dispatchEvent(
            new InputEvent(
                "input",
                {
                    bubbles: true,
                    inputType: "insertText",
                    data: reply
                }
            )
        );


        replyBox.focus();
    }


    // =========================================================
    // INITIALIZE
    // =========================================================

    function initialize() {

        createControls();

        console.log(
            "[SAI] Assistant initialized"
        );
    }


    // Gmail is SPA
    // Watch for Gmail DOM changes

    const observer =
        new MutationObserver(() => {

            createControls();

        });


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    initialize();

})();