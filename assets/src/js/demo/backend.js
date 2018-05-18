const DEV = window.location.hostname === 'localhost'
const BACKEND_ORIGIN = DEV ? window.location.origin : `//dyn.${window.location.hostname}`

export async function createAnnotationLink({anchor}) {
    const data = {annotation: {
        url: `http://${window.location.host}/demo`,
        anchors: [anchor]
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

    return await new Promise((resolve, reject) => {
        const complete = () => resolve({url: json.link})
        if (DEV) {
            setTimeout(complete, 1000)
        } else {
            complete()
        }
    })
}
