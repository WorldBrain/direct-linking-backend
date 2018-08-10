import { getDeploymentTier } from '../options'
import * as request from 'request-promise-native'

const developmentTier = getDeploymentTier()
const API_HOST = developmentTier === 'production'
    ? 'https://203bqy2f93.execute-api.eu-central-1.amazonaws.com/production'
    : 'https://a8495szyaa.execute-api.eu-central-1.amazonaws.com/staging'

const API_PATH = '/event'
const JSON_HEADER = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
}

export abstract class AnalyticsDefinition {
    abstract trackEvent({id, type} : {id : string, type: string}) : Promise<void>
}

export class Analytics {
    async trackEvent({ id, type }) {
        const data = {
            id,
            data: [{
                type,
                time: Date.now(),
            }]
        }
        
        const response = await request({
            uri: API_HOST + API_PATH,
            headers: JSON_HEADER,
            timeout: 3 * 1000,
            method: "POST",
            body: JSON.stringify(data),
        })
    }
}
