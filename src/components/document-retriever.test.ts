import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'
const express = require('express')
import { expect } from 'chai'
import { HttpDocumentRetriever } from "./document-retriever"

async function setupServer(configCallback) {
    const app = express()
    configCallback(app)

    const server = http.createServer(app)
    
    await new Promise((resolve, reject) => {
        server.listen(1237, (err) => {
            err ? reject(err) : resolve()
        })
    })

    return server
}

async function closeServer(server) {
    await new Promise((resolve, reject) => {
        server.close(err => err ? reject(err) : resolve())
    })
}

describe('HTTP Document retriever', () => {
    describe('retrieveDocument()', () => {
        it('should be able to retrieve a document', async () => {
            const server = await setupServer(app => {
                app.get('/test', (req, res) => {
                    res.type('text/plain')
                    res.send('yello!')
                })
            })
            
            try {
                const url = 'http://localhost:1237/test'
                const documentRetriever = new HttpDocumentRetriever()
                const document = await documentRetriever.retrieveDocument({url})
                expect(document).to.deep.equal({
                    content: 'yello!',
                    mime: 'text/plain',
                    url
                })
            } finally {
                closeServer(server)
            }
        })
    })

    describe('retrieveDocumentImage()', () => {
        it('should be able to retrieve a document image', async () => {
            const imagePath = path.join(__dirname, 'document-retriever.test.image.png');
            const server = await setupServer(app => {
                app.get('/test.png', (req, res) => {
                    res.sendFile(imagePath)
                })
            })
            
            try {
                const url = 'http://localhost:1237/test.png'
                const documentRetriever = new HttpDocumentRetriever()
                const documentImage = await documentRetriever.retrieveDocumentImage({metadata: {
                    imageUrls: {logo: url}
                }, type: 'logo'})
                expect(Buffer.isBuffer(documentImage.content)).to.be.true
                expect(documentImage.content.length).to.equal(fs.statSync(imagePath).size)
                expect(documentImage.mime).to.equal('image/png')
            } finally {
                closeServer(server)
            }
        })
    })
})
