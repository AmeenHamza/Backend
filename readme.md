# Complete Backend

## .gitkeep File

* git only files ko track krta h lekin agr hamain koi empty folders push krne hote h to wo usko track nhi krta
* iske lye hm .gitkeep ki file banate h
* isse hota kuch nhi h bs ek file h jisse git us folder ko track krleta h

# Prettierrc

* For setting up prettier 
* Like code mein kitne tabes ka gap rakhna h semicolon lagana h ya nhi single quotes or double quotes use karne h ya nhi 

# Prettierignore

* Like gitignore 
* K kis kis file mein prettier use nhi krna h

# DB Connection

* Industry standard or zyada better approach yhi k iffe mein connect ka code likho.

# Caution!

* When you work with module.js in Backend be careful when import files because on importing it gives an error.
* The error of extension (.js, .etc)

# ApiError.js

* ye file errors ko better way mein handle karne k lye banai h take hamara code ek standard form mein hojaye.
* Means k hamain pata ho k hr api mein errors isi tarah se aainge jo hm define karainge or _response_ bhi.
* # How to do that?
* First of all ek class banayye usmein node.js ki builtin error ki class ko inherit karain phir apna custom constructor banain usmein jo errors, messages aapko chahiye wo define karain
### Super keyword

* jo cheez override krni hoti h use pass krte h (for inheritence)

# ApiResponse.js

* ApiResponse class step by step using a real-world example. The ApiResponse class is designed to standardize the responses sent from an API. It helps to ensure that all responses have a _consistent_ format.
* *_this.success = statusCode < 400_*: Sets the instance's success property to true if the status code is less than 400, otherwise false. This is because HTTP status codes below 400 generally indicate successful responses.

# mongoose-aggregate-paginate-v2

* This is used for tracking or optimizing large data for example how many pages a document have.
* Current page konsa h iske baad kitne page h isse pehle page h ya nhi 
* Per page per elements ki limit kitni rakhni h ise hi _Aggregation pipeline_ bhi bolte h

# mongoose _pre_ hook

* It's like a singup api when we encrypt a password.
* But in profession projects this is done in the model file.
* Pre hook basically do somework before data going to databse(mtlb k data age transfer hone se pehle koi krne kl lye like _encryption_)

## userSchema.pre("save", async function(next){})

* why we take function here instead of callback ?
* Because callback have no property of _this_ or yahan hamain ye indicate krna h k hamain userSchema ki properties mein se password per kuch function perform krna h or agr hamare pass this ka keyword nhi hoga to hm kese use indicate karainge.

# Methods in _mongoose_

* mongoose hamain boht si functionalities provide krta h jis mein se sab se important _methods_ h
* ab isse faida kia hoga k hm is mein apne custom methods create krsakte h jese hm user ko _login_ krne k lye alg se _API_ banate h usmein poora code likhte h or aese hi _signup_ k lye
* mongoose se faida kia hoga k hm _userModel_ mein hi ek method add krdainge