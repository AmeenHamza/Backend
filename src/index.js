import dotenv from "dotenv";
import connectDB from './db/index.js';
import {app} from './app.js';

dotenv.config({
    path: './.env'
});

// Second Apporach or more better approach

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App listening on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
})


// This is the basic approach to connect database

// (async () => {
//     try {
//         const newIns = await connect(process.env.MONGODB_URI);
//         console.log(newIns.connection.host);

//         // For error handling if for some reason the backend is unable to talk with database
//         app.on("error", (err) => {
//             console.log("ERROR: ", err);
//             throw err
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}`);
//         })

//     } catch (error) {
//         console.error("Error: ", error);
//         throw error
//     }
// })()