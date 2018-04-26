const BACKEND_ORIGIN = window.location.hostname === 'localhost' ? window.location.origin : `//dyn.${window.location.hostname}`

export async function createAnnotationLink() {
    const data = {annotation: {
        url: `http://${window.location.host}/demo`,
        achors: []
    }}
    const response = await fetch(BACKEND_ORIGIN, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        redirect: 'error',
        body: JSON.stringify(data)
    })
    const json = await response.json()
    
    return {url: json.link}

    // return await new Promise((resolve, reject) => {
    //     setTimeout(() => resolve({url: 'http://memex.link/aefdawfe/memex.link/demo'}), 2000)
    // })
}
