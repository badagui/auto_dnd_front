import { sendMessage } from './serverComms.js';
import { initFirebaseAndAuthUser } from './firebaseAuth.js';

let campaignId = null;
window.onload = init;
let campaign_intro_img_url = null;

async function init() {
    toggleInputs(false);
    const urlParams = new URLSearchParams(window.location.search);
    campaignId = urlParams.get('campaignId');
    
    const response = await sendMessage('load_campaign/', { 
        'user_token': (await initFirebaseAndAuthUser()).idToken, 
        'campaign_id': campaignId 
    });
    processResponse(response);
}

window.sendButton = async function() {
    // get message and add to chat log
    let message = document.getElementById("messageInput").value;
    // ignore empty
    if (message == '') { 
        return; 
    } 
    // if not a tick message, add to chat log
    if (message != ' ') {
        let chatLogNewMsg = document.createElement("pre");
        chatLogNewMsg.textContent = `User: ${message}`;
        document.getElementById("chatLog").appendChild(chatLogNewMsg);
        document.getElementById("chatLog").scrollTop = chatLog.scrollHeight;
    }
    // clear input
    document.getElementById("messageInput").value = '';
    toggleInputs(false);
    // send message
    const response = await sendMessage(
        'process_input/', {'user_token': (await initFirebaseAndAuthUser()).idToken, 
        'campaign_id': campaignId, 
        'content': message
    });
    // console.log('process_input response', response);
    processResponse(response);
}

function processResponse(response) {
    console.log('response:', response)
    
    setNewNotes("charSheetText", formatCharSheet(response.char_sheet));
    setNewNotes("campaignNotesText", formatCampaignNotes(response.campaign_notes));
    const campaign_intro_img_base64 = response.campaign_intro_img_b64;
    if (campaign_intro_img_base64) {
        console.log('campaign_intro_img_base64 RECEIVED AND BEING SET') // TEST
        campaign_intro_img_url = `data:image/png;base64,${campaign_intro_img_base64}`;
    }
    setNewMessages("chatLog", response.messages);
    setNewCredits(response.credits);

    // not user turn mode
    if (!response.is_user_turn){
        // enable button but disable input
        toggleInputs(true, "Continue...") 
        let messageInput = document.getElementById("messageInput");
        messageInput.value = ' ';
        messageInput.disabled = true;
        messageInput.style.backgroundColor = "lightgray";
        // auto followup
        sendButton();
    } else if (response.messages.length == 1) {
        // first msg
        toggleInputs(true, "Let's Begin!")
        messageInput.value = "Let's begin!";
        messageInput.disabled = true;
        messageInput.style.backgroundColor = "lightgray";
    }   else {
        toggleInputs(true, "Send");
    }

}

function formatCharSheet(charSheet) {
    charSheet = charSheet.replace("PLAYER CHARACTER SHEET:\n", '');
    charSheet = charSheet.replace("name:", 'Name:');
    charSheet = charSheet.replace("level", "Level");
    charSheet = charSheet.replace("experience", "Experience");
    charSheet = charSheet.replace("race", "Race");
    charSheet = charSheet.replace("class", "Class");
    charSheet = charSheet.replace("alignment", "Alignment");
    charSheet = charSheet.replace("background", "Background");
    return charSheet;
}

function formatCampaignNotes(campaignNotes) {
    campaignNotes = campaignNotes.replace("GM CAMPAIGN NOTES:\n", '');
    campaignNotes = campaignNotes.replace("[CAMPAIGN_NAME]:", '<strong>Campaign Name:</strong>');
    campaignNotes = campaignNotes.replace("[GEOGRAPHY_AND_CLIMATE]:", '<br><strong>World Geography:</strong>');
    campaignNotes = campaignNotes.replace("[WORLD_LORE]:", '<br><strong>World Lore:</strong>');
    campaignNotes = campaignNotes.replace("[CITIES]:", '<br><strong>Cities:</strong>');
    campaignNotes = campaignNotes.replace("[FACTIONS]:", '<br><strong>Factions:</strong>');
    campaignNotes = campaignNotes.replace("[MAIN_STORYLINE]:", '<br><strong>Main Storyline:</strong>');
    campaignNotes = campaignNotes.replace("[SIDEQUESTS]:", '<br><strong>Sidequests:</strong>');
    campaignNotes = campaignNotes.replace("[NPCS]:", '<br><strong>NPCs:</strong>');
    return campaignNotes
}

function setNewNotes(elementId, newNotes, title='') {
    let textBox = document.getElementById(elementId);
    textBox.innerHTML = '';
    if (title) {
        let newTitle = document.createElement("strong");
        newTitle.textContent = title;
        textBox.appendChild(newTitle);
    }
    let newMsg = document.createElement("pre");
    newMsg.innerHTML = newNotes;
    textBox.appendChild(newMsg);
}

function setNewMessages(chatLogId, messages) {
    let chatLog = document.getElementById(chatLogId);
    chatLog.innerHTML = '';
    for (let i = 0; i < messages.length; i++) {
        // skip assistant messages without content
        if (messages[i].role == "assistant" && messages[i].content == null) { continue; }
        // set message
        let chatLogNewMsg = document.createElement("pre");
        let prefix = messages[i].role == 'user' ? 'User:' : messages[i].role == 'assistant' ? 'GM:' : messages[i].role == 'tool' ? 'Tool:' : '';
        chatLogNewMsg.textContent = `${prefix} ${messages[i].content}`;
        // pick a color
        if (messages[i].role === 'user') {
            chatLogNewMsg.style.color = 'darkgreen';
        }
        else if (messages[i].role === 'tool') {
            chatLogNewMsg.style.color = 'sienna';
        }
        else if (messages[i].role === 'assistant') {
            chatLogNewMsg.style.color = 'darkblue';
        }
        // add message
        chatLog.appendChild(chatLogNewMsg);
        
        // // scroll to bottom
        // chatLog.scrollTop = chatLog.scrollHeight;
        
        // on 8th message add the campaign intro img url
        if (i == 8) {
            console.log('I NEED THE IMAGE NOWW', campaign_intro_img_url) // TEST
            let img = document.createElement("img");
            img.src = campaign_intro_img_url;
            img.style.width = '100%';
            chatLog.appendChild(img);
        
        }
    }
}

function setNewCredits(credits) {
    let creditsBox = document.getElementById("creditsText");
    creditsBox.innerHTML = `Credits: ${credits}`;
}

function toggleInputs(enable, send_button_text="Send") {
    let messageInput = document.getElementById("messageInput");
    let sendButton = document.querySelector("button");

    messageInput.disabled = !enable;
    messageInput.style.backgroundColor = enable ? "" : "lightgray"; // default or gray

    sendButton.disabled = !enable;
    sendButton.style.backgroundColor = enable ? "" : "lightgray"; // default or gray

    if (enable) {
        // set new button text
        let buttonText = document.getElementById('buttonText');
        buttonText.textContent = send_button_text;
    }

}

// event listener for the input field to detect the enter key press
document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("keypress", function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("sendButton").click();
        }
    });
});