import { getDeploymentTier } from './utils'

const developmentTier = getDeploymentTier()
const API_HOST = developmentTier === 'production'
    ? 'https://2s1jj0js02.execute-api.eu-central-1.amazonaws.com/production'
    : 'https://a8495szyaa.execute-api.eu-central-1.amazonaws.com/staging'

const API_PATH = '/event'
const JSON_HEADER = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
}

export async function trackEvent({ id, type }) {
    const data = {
        id,
        data: [{
            type,
            time: Date.now(),
        }]
    }

    const res = await fetch(API_HOST + API_PATH, {
        method: 'POST',
        headers: JSON_HEADER,
        body: JSON.stringify(data),
    })
}