

// NEW - generic send with callback

export async function sendMessage(endpoint, message) {
    // const base_url = 'http://127.0.0.1:8000' // local
    const base_url = 'https://auto-dnd-e6db93336cd9.herokuapp.com'
    console.log(`sending message ${message}, to ${base_url}/${endpoint}`)
    const resp = await fetch(`${base_url}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });
    if (resp.ok) {
        const data = await resp.json();
        return data;
    } else {
        console.log('sendMessage error:', resp.status, resp.statusText);
    }
}
