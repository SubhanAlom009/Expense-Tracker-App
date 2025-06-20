import arcjet, { tokenBucket } from "@arcjet/next"


const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"],
    rules:[
        tokenBucket({
            mode:"LIVE",
            refillRate: 10, // 10 requests per second
            interval: 3600, // refill every hour
            capacity: 10, // maximum burst of 20 requests
        })
    ]
})

export default aj;