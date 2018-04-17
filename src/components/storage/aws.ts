import * as AWS from 'aws-sdk'

export interface AwsStorageConfig {
  bucketName : string
  bucketRegion : string
}

// export class AwsStorage implements Storage {
//   public _s3

//   constructor(config : AwsStorageConfig) {
//     AWS.config.update({region: 'eu-west-1'})
//     this._s3 = new AWS.S3({apiVersion: '2006-03-01'})
//   }
// }
