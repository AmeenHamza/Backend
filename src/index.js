import dotenv from "dotenv";
import connectDB from './db/index.js';

dotenv.config({
    path: './.env'
});

// Second Apporach or more better approach

connectDB();


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